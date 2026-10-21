import { Link, NavLink, useNavigate } from "react-router-dom";
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
        <Link to="/" className="logo" aria-label="Khata home">
          khata<span className="logo-dot">.</span>
        </Link>

        <nav className="header-nav" aria-label="Main navigation">
          {user ? (
            <>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `btn btn-ghost btn-sm${isActive ? " is-active" : ""}`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `btn btn-ghost btn-sm${isActive ? " is-active" : ""}`
                }
              >
                Profile
              </NavLink>
              <span className="header-user">{user.name}</span>
              <span className="avatar avatar-sm" aria-hidden="true">
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
