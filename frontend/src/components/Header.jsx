import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">S</span>
          Splitwise
        </Link>
        <nav className="header-nav">
          <Link to="/login" className="btn btn-ghost btn-sm">
            Sign in
          </Link>
          <Link to="/signup" className="btn btn-primary btn-sm">
            Create account
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
