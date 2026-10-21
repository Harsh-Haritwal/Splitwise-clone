import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container page">
      <div className="notfound">
        <p className="eyebrow">404 / Wrong ledger</p>
        <h1 className="section-title">Page not found</h1>
        <p className="section-subtitle">
          The page you are looking for does not exist.
        </p>
        <Link to="/" className="btn btn-primary mt-24">
          Go home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
