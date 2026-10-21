import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">S</span>
          Splitwise
        </Link>
        <nav className="header-nav"></nav>
      </div>
    </header>
  );
}

export default Header;
