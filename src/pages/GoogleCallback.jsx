import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserFromGoogle } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const userRaw = searchParams.get("user");
    const error = searchParams.get("error");

    if (error || !token || !userRaw) {
      toast.error("Google login failed. Please try again.");
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw));
      setUserFromGoogle(token, user);

      toast.success(`Welcome, ${user.name}!`);
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch {
      toast.error("Google login failed. Please try again.");
      navigate("/login");
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <p>Signing you in with Google...</p>
    </div>
  );
};

export default GoogleCallback;
