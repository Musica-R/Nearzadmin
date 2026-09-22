import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lk-login">
      <div className="lk-login__card">
        <div className="lk-login__brand">
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
            <defs>
              <linearGradient id="lkPinGrad2" x1="4" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#0d1826" />
                <stop offset="0.5" stopColor="#14213d" />
                <stop offset="1" stopColor="#2a3b64" />
              </linearGradient>
            </defs>
            <path
              d="M18 2C10.8 2 5 7.8 5 15c0 9.5 11.4 18 12.3 18.6a1.2 1.2 0 0 0 1.4 0C19.6 33 31 24.5 31 15c0-7.2-5.8-13-13-13Z"
              fill="url(#lkPinGrad2)"
            />
            <circle cx="18" cy="15" r="5.4" fill="#ff6b35" />
          </svg>
          <h1>Thozhaa Admin</h1>
          <p>Sign in to manage the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="lk-login__form">
          <label className="lk-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@Thozhaa.com"
              required
            />
          </label>

          <label className="lk-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <div className="lk-login__error">{error}</div>}

          <button type="submit" className="lk-login__btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}