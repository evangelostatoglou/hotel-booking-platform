import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { getUserInitials } from "../utils/formatters";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function cancelUserMenuClose() {
    if (userMenuCloseTimer.current) {
      clearTimeout(userMenuCloseTimer.current);
      userMenuCloseTimer.current = null;
    }
  }

  function scheduleUserMenuClose() {
    cancelUserMenuClose();
    userMenuCloseTimer.current = setTimeout(() => {
      setUserMenuOpen(false);
      userMenuCloseTimer.current = null;
    }, 400);
  }

  async function handleLogout() {
    await logout();
    cancelUserMenuClose();
    setUserMenuOpen(false);
    navigate("/");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <button
        className="menu-button"
        type="button"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className="menu-icon">☰</span> Menu
      </button>

      <Link className="logo" to="/">
        Hotel Tatoli
      </Link>

      <nav className="header-actions" aria-label="Main navigation">
        {user ? (
          <div
            className="user-menu"
            onMouseEnter={cancelUserMenuClose}
            onMouseLeave={scheduleUserMenuClose}
          >
            <button
              className="user-menu-button"
              type="button"
              aria-expanded={userMenuOpen}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              {getUserInitials(user)} <span aria-hidden="true">⌄</span>
            </button>
            {userMenuOpen && (
              <div className="user-menu-dropdown">
                <Link to="/profile" onClick={() => setUserMenuOpen(false)}>My profile</Link>
                <Link to="/bookings" onClick={() => setUserMenuOpen(false)}>My bookings</Link>
                <button type="button" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/auth/login">Login</Link>
            <Link to="/auth/register">Register</Link>
          </>
        )}
        <Link className="book-button" to="/booking">
          Book Now
        </Link>
      </nav>

      {menuOpen && (
        <div className="mobile-menu" onMouseLeave={closeMenu}>
          <button className="menu-close" type="button" onClick={closeMenu} aria-label="Close menu">
            ×
          </button>
          <Link to="/rooms" onClick={closeMenu}>Rooms</Link>
          <a href="/#experience" onClick={closeMenu}>Experience</a>
          <a href="/#contact" onClick={closeMenu}>Contact</a>
          <Link to="/profile" onClick={closeMenu}>My profile</Link>
        </div>
      )}
    </header>
  );
}
