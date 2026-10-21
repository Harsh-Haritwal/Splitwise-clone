import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/auth-context";

function Signup() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all the fields");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const data = await api.post("/user/signup", {
        name: name.trim(),
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
          <p className="eyebrow">A new ledger / Vol. 01</p>
          <h1 className="poster-title">
            Start with
            <br />
            one bill.
            <br />
            <span>Keep the peace.</span>
          </h1>
          <p className="poster-copy">
            Create a circle for your flat, your trip or your Sunday football
            crew. Khata keeps the maths tidy so you can get back to the parts of
            friendship that do not involve calculators.
          </p>
        </div>

        <div className="poster-slip">
          <div className="poster-slip-top">
            <span>Khata / New account</span>
            <span>No. 002</span>
          </div>
          <p>“Every good friendship deserves a clean ledger.”</p>
          <div className="poster-slip-code">K / 002 / 026</div>
        </div>
      </section>

      <div className="auth-panel">
        <div className="auth-card">
          <p className="eyebrow">Open your ledger</p>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Start splitting bills with friends in a few seconds.
          </p>

          {error && <div className="alert alert-error mb-16">{error}</div>}

          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                className="input"
                maxLength="50"
                placeholder="Harsh Haritwal"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
              />
            </div>

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
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
              />
              <span className="field-hint">Use 8 characters or more.</span>
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                className="input"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
