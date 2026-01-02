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
      ? "https://lybrary8-0.onrender.com/api/auth/login"
      : "https://lybrary8-0.onrender.com/api/auth/signup";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();

      if (!res.ok) {
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

  /* ================= GOOGLE AUTH ================= */
  const handleGoogleLogin = async (credential) => {
    try {
      const res = await fetch("https://lybrary8-0.onrender.com/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Google authentication failed");
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

          {/* ROLE SWITCH */}
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

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
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
                onChange={handleChange}
                required
              />
            )}

            {!isLogin && role === "admin" && (
              <input
                type="password"
                name="adminCode"
                placeholder="Admin Secret Code"
                value={formData.adminCode}
                onChange={handleChange}
                required
              />
            )}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Login" : "Signup"}
            </button>
          </form>

          {/* GOOGLE AUTH (LOGIN + SIGNUP) */}
          <div className="google-box">
            <p>or</p>
            <GoogleLogin
              onSuccess={(res) => handleGoogleLogin(res.credential)}
              onError={() => alert("Google Authentication Failed")}
            />
            
          </div>

          {/* TOGGLE */}
          <p className="toggle-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? " Signup" : " Login"}
            </span>
          </p>
        </div>
      </div>

      {/* CSS */}
      <style>{`
  * {
    box-sizing: border-box;
    font-family: "Inter", "Segoe UI", Arial, sans-serif;
  }

  body {
    margin: 0;
  }

  /* Page background */
  .auth-wrapper {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(
      135deg,
      #1e1f29,
      #2b2d42
    );
  }

  /* Auth card */
  .auth-container {
    width: 420px;
    background: #2f3136; /* Discord dark */
    padding: 28px;
    border-radius: 14px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.45);
    color: #ffffff;
  }

  /* Heading */
  h2 {
    text-align: center;
    margin-bottom: 22px;
    font-size: 22px;
    font-weight: 600;
  }

  /* Role switch */
  .role-switch {
    display: flex;
    gap: 10px;
    margin-bottom: 22px;
  }

  .role-switch button {
    flex: 1;
    padding: 12px;
    border: none;
    background: #202225;
    color: #b9bbbe;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
  }

  .role-switch .active {
    background: #5865F2; /* Discord blue */
    color: #ffffff;
  }

  /* Inputs */
  input {
    width: 100%;
    padding: 12px;
    margin-bottom: 16px;
    border-radius: 8px;
    border: none;
    background: #202225;
    color: #ffffff;
    font-size: 14px;
  }

  input::placeholder {
    color: #8e9297;
  }

  input:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(88,101,242,0.6);
  }

  /* Password field */
  .password-box {
    position: relative;
  }

  .toggle-password {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #5865F2;
    font-weight: 600;
    font-size: 13px;
  }

  /* Main button */
  .auth-btn {
    width: 100%;
    padding: 13px;
    background: #5865F2;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 6px;
    transition: background 0.2s ease;
  }

  .auth-btn:hover {
    background: #6d79f6;
  }

  .auth-btn:disabled {
    background: #4f545c;
    cursor: not-allowed;
  }

  /* Google login */
  .google-box {
    margin-top: 18px;
    text-align: center;
  }

  .google-text {
    margin-top: 10px;
    font-size: 13px;
    color: #b9bbbe;
  }

  /* Toggle login/signup */
  .toggle-text {
    text-align: center;
    margin-top: 18px;
    font-size: 14px;
    color: #b9bbbe;
  }

  .toggle-text span {
    color: #5865F2;
    cursor: pointer;
    font-weight: 600;
  }
`}</style>

    </>
  );
};

export default Auth;
