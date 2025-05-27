import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

interface AuthenticationProps {
  isOpen: boolean;
}

interface DecodedGoogleToken {
  given_name?: string;
  family_name?: string;
  email: string;
  name?: string;
  picture?: string;
}

const Authentication: React.FC<AuthenticationProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <div className="fixed p-4 top-0 left-0 flex items-center justify-center h-screen w-screen bg-black bg-opacity-30 z-50 font-Poppins">
      <div className="w-[380px] xl:w-[420px] h-1/2 bg-white rounded-lg p-6 shadow-lg space-y-6">
        <h1 className="text-2xl font-bold text-center">Sign in to CosmoChat</h1>

        <div className="space-y-4">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                const decodedToken = jwtDecode<DecodedGoogleToken>(
                  credentialResponse.credential
                );
                console.log("Login Successful", decodedToken);

                navigate("/chat");
              }
            }}
            onError={() => {
              console.error("Login Failed");
            }}
            useOneTap
            auto_select
            shape="rectangular"
            size="large"
            text="continue_with"
            width="100%"
          />
        </div>

        <p className="text-sm text-center text-gray-500">
          By continuing, you agree to our{" "}
          <a href="#" className="text-indigo-600 underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-indigo-600 underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Authentication;
