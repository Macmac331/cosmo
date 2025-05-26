import { useState } from "react";

const Landing = () => {
  const [stars] = useState(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${0.2 + Math.random() * 4}px`,
      brightness: 0.8 + Math.random() * 0.2,
      twinkleSpeed: 3 + Math.random() * 4,
      driftX: (Math.random() - 0.5) * 40,
      driftY: (Math.random() - 0.5) * 20,
      driftSpeed: 30 + Math.random() * 30,
    }));
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              opacity: star.brightness,
              animation: `
                twinkle ${star.twinkleSpeed}s infinite ease-in-out,
                drift-${star.id} ${star.driftSpeed}s infinite alternate ease-in-out
              `,
              boxShadow: `0 0 ${parseFloat(star.size) * 1.5}px ${
                parseFloat(star.size) * 0.5
              }px rgba(255, 255, 255, ${star.brightness * 0.5})`,
              transform: "translate(0, 0)",
            }}
          />
        ))}
      </div>

      <style>
        {`
          @keyframes twinkle {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}
        {stars.map(
          (star) => `
          @keyframes drift-${star.id} {
            0% { transform: translate(0, 0); }
            100% { transform: translate(${star.driftX}px, ${star.driftY}px); }
          }
        `
        )}
      </style>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold">CosmoChat</span>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg transition">
            Start Now
          </button>
        </nav>

        <main className="mt-16 sm:mt-24 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
            Connect Across the Cosmos
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto">
            Experience real-time video chats with random people from around the
            world. Our platform makes meeting new friends as vast as the
            universe.
          </p>

          <div className="mt-10 relative">
            <div className="absolute -inset-4 bg-purple-500 rounded-2xl opacity-10 blur-lg"></div>
            <div className="relative bg-gray-800 rounded-xl border border-gray-700 overflow-hidden w-full max-w-2xl mx-auto h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-purple-900/30 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-20 h-20 rounded-full bg-indigo-600 mx-auto mb-4 flex items-center justify-center">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium">
                    Discover New Connections
                  </h3>
                  <p className="mt-2 text-gray-400"></p>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 w-16 h-16 rounded-lg bg-gray-700 border border-gray-600 overflow-hidden flex items-center justify-center">
                <div className="w-12 h-12 bg-indigo-500 rounded flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-36 py-8 border-t border-gray-800 text-center text-gray-400">
          <p>
            © {new Date().getFullYear()} CosmoChat. Explore the universe of
            connections.
          </p>
        </footer>
      </div>
    </div>
  );
};
export default Landing;
