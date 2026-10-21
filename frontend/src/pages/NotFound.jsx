import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container page">
      <div className="auth-card">
        <h1 className="auth-title">Page not found</h1>
        <p className="auth-subtitle">The page you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary btn-block">
          Go home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
