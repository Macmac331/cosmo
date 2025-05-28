import React, { useEffect, useRef, useState } from "react";

const Home = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<string>("Connecting to server...");
  const [error, setError] = useState<string | null>(null);
  const [cameraInUse, setCameraInUse] = useState<boolean>(false); // new state to track camera availability

  // Initialize media and WebSocket connection
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await getMedia();
      } catch (err) {
        if (err instanceof Error && err.name === "NotReadableError") {
          // Camera in use, but continue to connect to server
          console.warn("Camera is in use, skipping local video display");
          setCameraInUse(true);
          setStatus("Camera in use, connecting without local video...");
        } else {
          console.error("Initialization error:", err);
          setError("Failed to initialize application");
          return; // don't continue if other errors
        }
      }

      setupWebSocket();
    };

    initializeApp();

    return () => {
      cleanupConnections();
    };
  }, []);

  const getMedia = async () => {
    setStatus("Requesting camera/microphone access...");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
      audio: true,
    });

    localStreamRef.current = stream;

    if (!cameraInUse && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    setStatus("Connected to local media. Waiting for match...");
  };

  const setupWebSocket = () => {
    try {
      const socket = new WebSocket("ws://localhost:8080/ws");
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected");
        setStatus("Connected to server. Waiting for match...");
      };

      socket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received:", data);

          switch (data.type) {
            case "match":
              setStatus("Stranger connected! Starting call...");
              await startCall();
              break;
            case "offer":
              await handleOffer(data);
              break;
            case "answer":
              await handleAnswer(data);
              break;
            case "ice-candidate":
              await handleCandidate(data);
              break;
            case "peer-left":
              endCall("Stranger disconnected");
              break;
            default:
              console.warn("Unknown message type", data.type);
          }
        } catch (err) {
          console.error("Error handling message:", err);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Connection error. Please refresh the page.");
      };

      socket.onclose = () => {
        console.log("WebSocket closed");
        setStatus("Disconnected from server");
      };
    } catch (err) {
      console.error("WebSocket setup error:", err);
      setError("Failed to connect to server");
      throw err;
    }
  };

  const startCall = async () => {
    try {
      const pc = createPeerConnection();
      const stream = localStreamRef.current;

      if (stream && !cameraInUse) {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current?.send(
        JSON.stringify({
          type: "offer",
          sdp: offer,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.error("Error starting call:", err);
      setError("Failed to start call");
      endCall();
    }
  };

  const handleOffer = async (data: any) => {
    try {
      const pc = createPeerConnection();
      const stream = localStreamRef.current;

      if (stream && !cameraInUse) {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      }

      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current?.send(
        JSON.stringify({
          type: "answer",
          sdp: answer,
          timestamp: new Date().toISOString(),
        })
      );

      setStatus("Call connected!");
    } catch (err) {
      console.error("Error handling offer:", err);
      setError("Failed to handle call offer");
      endCall();
    }
  };

  const handleAnswer = async (data: any) => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) {
        throw new Error("No peer connection");
      }

      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      setStatus("Call connected!");
    } catch (err) {
      console.error("Error handling answer:", err);
      setError("Failed to handle call answer");
      endCall();
    }
  };

  const handleCandidate = async (data: any) => {
    try {
      const pc = peerConnectionRef.current;
      if (pc && data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    } catch (err) {
      console.error("Error handling ICE candidate:", err);
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.send(
          JSON.stringify({
            type: "ice-candidate",
            candidate: e.candidate,
            timestamp: new Date().toISOString(),
          })
        );
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "disconnected") {
        endCall("Connection lost");
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const endCall = (message?: string) => {
    if (message) {
      setStatus(message);
    }

    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Stop local stream tracks
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    // Reconnect to server for new match
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      setStatus("Disconnected. Waiting for new match...");
    }
  };

  const cleanupConnections = () => {
    socketRef.current?.close();
    peerConnectionRef.current?.close();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
  };

  const restartCall = async () => {
    cleanupConnections();
    setError(null);
    setStatus("Reconnecting...");
    setCameraInUse(false);
    try {
      await getMedia();
      setupWebSocket();
    } catch (err) {
      console.error("Restart error:", err);
      setError("Failed to reconnect");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Omegle Clone</h2>

      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <h3 className="text-sm text-gray-600 mb-2">You</h3>
          {/* Only show video if camera not in use */}
          {!cameraInUse ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-80 h-60 rounded-lg shadow bg-black"
            />
          ) : (
            <div className="w-80 h-60 rounded-lg shadow bg-gray-700 flex items-center justify-center text-white">
              Camera in use
            </div>
          )}
        </div>

        <div className="flex flex-col items-center">
          <h3 className="text-sm text-gray-600 mb-2">Stranger</h3>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-80 h-60 rounded-lg shadow bg-black"
          />
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-gray-600">{status}</p>
        {error && (
          <>
            <p className="text-red-500">{error}</p>
            <button
              onClick={restartCall}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
