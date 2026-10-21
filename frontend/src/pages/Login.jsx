import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/auth-context";

function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);
    try {
      const data = await api.post("/user/login", {
        email: email.trim(),
        password: password,
      });
      login(data.token);
      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <section className="auth-poster" aria-label="About Khata">
        <Link to="/" className="logo auth-logo">
          khata<span className="logo-dot">.</span>
        </Link>

        <div>
          <p className="eyebrow">Shared money / kept human</p>
          <h1 className="poster-title">
            Paying friends
            <br />
            should not feel
            <br />
            <span>like a spreadsheet.</span>
          </h1>
          <p className="poster-copy">
            A plain-spoken ledger for trips, flats and the people who never
            carry cash. Everyone sees the same numbers, and nobody has to send
            the awkward reminder.
          </p>
        </div>

        <div className="poster-slip">
          <div className="poster-slip-top">
            <span>Khata / No. 001</span>
            <span>Est. 2026</span>
          </div>
          <p>“The bill is split. The friendship is intact.”</p>
          <div className="poster-slip-code">K / 001 / 026</div>
        </div>
      </section>

      <div className="auth-panel">
        <div className="auth-card">
          <p className="eyebrow">Return to your ledger</p>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">
            Sign in to keep track of shared expenses with your groups.
          </p>

          {error && <div className="alert alert-error mb-16">{error}</div>}

          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                maxLength="254"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                maxLength="128"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
