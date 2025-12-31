import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const Auth = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(false);
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    enrollment: "",
    adminCode: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ================= EMAIL LOGIN / SIGNUP ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = isLogin
      ? "http://localhost:5000/api/auth/login"
      : "http://localhost:5000/api/auth/signup";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Something went wrong");
      } else {
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: data.name || formData.name,
            email: data.email || formData.email,
            role: data.role || role,
          })
        );

        navigate(
          (data.role || role) === "admin"
            ? "/admin-dashboard"
            : "/student-dashboard"
        );

        setFormData({
          name: "",
          email: "",
          password: "",
          enrollment: "",
          adminCode: "",
        });
      }
    } catch {
      alert("Server not responding");
    } finally {
      setLoading(false);
    }
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleLogin = async (credential) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Google login failed");
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: data.name,
          email: data.email,
          role: data.role,
        })
      );

      navigate(
        data.role === "admin"
          ? "/admin-dashboard"
          : "/student-dashboard"
      );
    } catch {
      alert("Google login error");
    }
  };

  return (
    <>
      <div className="auth-wrapper">
        <div className="auth-container">
          <h2>{isLogin ? "Login" : "Signup"} - Library Management</h2>

          {/* Role Switch */}
          <div className="role-switch">
            <button
              type="button"
              className={role === "student" ? "active" : ""}
              onClick={() => setRole("student")}
            >
              Student
            </button>
            <button
              type="button"
              className={role === "admin" ? "active" : ""}
              onClick={() => setRole("admin")}
            >
              Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                required
                onChange={handleChange}
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              required
              onChange={handleChange}
            />

            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                required
                onChange={handleChange}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            {!isLogin && role === "student" && (
              <input
                type="text"
                name="enrollment"
                placeholder="Enrollment Number"
                value={formData.enrollment}
                required
                onChange={handleChange}
              />
            )}

            {!isLogin && role === "admin" && (
              <input
                type="password"
                name="adminCode"
                placeholder="Admin Secret Code"
                value={formData.adminCode}
                required
                onChange={handleChange}
              />
            )}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Login" : "Signup"}
            </button>
          </form>

          {/* GOOGLE LOGIN (ONLY FOR LOGIN MODE) */}
          {isLogin && (
            <div style={{ marginTop: "15px", textAlign: "center" }}>
              <p>or</p>
              <GoogleLogin
                onSuccess={(res) => handleGoogleLogin(res.credential)}
                onError={() => alert("Google Login Failed")}
              />
            </div>
          )}

          <p className="toggle-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? " Signup" : " Login"}
            </span>
          </p>
        </div>
      </div>

      {/* CSS (UNCHANGED) */}
      <style>{`
        * {
          box-sizing: border-box;
          font-family: Arial, sans-serif;
        }

        .auth-wrapper {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f4f6f8;
        }

        .auth-container {
          max-width: 420px;
          width: 100%;
          background: #fff;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
        }

        .role-switch {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .role-switch button {
          width: 48%;
          padding: 10px;
          border: none;
          cursor: pointer;
          background: #ddd;
          border-radius: 5px;
          font-weight: bold;
        }

        .role-switch .active {
          background: #008080;
          color: #fff;
        }

        form input {
          width: 100%;
          padding: 10px;
          margin-bottom: 15px;
          border-radius: 5px;
          border: 1px solid #ccc;
        }

        .password-box {
          position: relative;
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #008080;
          font-size: 14px;
          font-weight: bold;
        }

        .auth-btn {
          width: 100%;
          padding: 12px;
          border: none;
          background: #ff3700;
          color: white;
          font-size: 16px;
          border-radius: 5px;
          cursor: pointer;
        }

        .auth-btn:hover:not(:disabled) {
          background: #e03100;
        }

        .auth-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .toggle-text {
          text-align: center;
          margin-top: 15px;
          color: #555;
        }

        .toggle-text span {
          color: #008080;
          cursor: pointer;
          font-weight: bold;
        }
      `}</style>
    </>
  );
};

export default Auth;
