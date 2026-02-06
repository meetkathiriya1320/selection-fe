import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Card from "../components/common/Card";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import "./Auth.css";

import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success("Welcome back!");
      if (result.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate(from, { replace: true });
      }
    } else {
      toast.error(result.message);
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
        className="auth-wrapper"
        style={{ width: "100%", maxWidth: "420px" }}
      >
        <Card className="auth-card">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in to manage your bookings and profile</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
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

            <Button
              type="submit"
              variant="primary"
              style={{ width: "100%", marginTop: "0.5rem" }}
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link to="/register">Create an account</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
