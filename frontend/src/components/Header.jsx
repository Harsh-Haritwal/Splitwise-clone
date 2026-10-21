import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">S</span>
          Splitwise
        </Link>

        <nav className="header-nav">
          {user ? (
            <>
              <Link to="/" className="btn btn-ghost btn-sm">
                Dashboard
              </Link>
              <span className="header-user">{user.name}</span>
              <span className="avatar avatar-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign in
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
