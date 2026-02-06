import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Card from "../components/common/Card";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import "./Auth.css";

import toast from "react-hot-toast";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("register"); // 'register' | 'otp'
  const [isLoading, setIsLoading] = useState(false);

  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (step === "register") {
      const result = await register(name, email, password);
      if (result.success) {
        toast.success("OTP sent to your email!");
        setStep("otp");
      } else {
        toast.error(result.message);
      }
    } else {
      const result = await verifyOtp(email, otp);
      if (result.success) {
        toast.success("Account verified! Welcome!");
        navigate("/");
      } else {
        toast.error(result.message);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <Link to="/" className="auth-back-link">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: "420px" }}
      >
        <Card className="auth-card">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join us to explore exclusive selections</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {step === "register" ? (
              <>
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </>
            ) : (
              <Input
                label="Enter OTP"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            )}

            <Button
              type="submit"
              variant="primary"
              style={{ width: "100%", marginTop: "0.5rem" }}
              isLoading={isLoading}
            >
              {step === "register" ? "Sign Up" : "Verify & Login"}
            </Button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
