import { NavLink, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import "./Navbar.css";
import logo from "../assets/logo.png";
import { useState, useEffect } from "react";

import playstationIcon from "../assets/platforms/playstation.png";
import xboxIcon from "../assets/platforms/xbox.svg";
import steamIcon from "../assets/platforms/steam.png";
import nintendoLogo from "../assets/platforms/nintendo.svg";
import techLogo from "../assets/platforms/tech.svg";

function ThemeToggle({ position = "under-search" }) {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <div
      className={`theme-toggle ${
        position === "bottom" ? "theme-toggle-bottom" : "theme-toggle-inline"
      }`}
    >
      <span
        className={`theme-option ${theme === "dark" ? "active" : ""}`}
        onClick={() => toggleTheme("dark")}
      >
        DARK MODE
      </span>
      <span className="divider">|</span>
      <span
        className={`theme-option ${theme === "light" ? "active" : ""}`}
        onClick={() => toggleTheme("light")}
      >
        LIGHT MODE
      </span>
    </div>
  );
}

function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [animate, setAnimate] = useState("");
  const navigate = useNavigate();

  const toggleMenu = () => {
    if (isOpen) {
      setAnimate("close");
      setTimeout(() => {
        setIsOpen(false);
        setAnimate("");
      }, 350);
    } else {
      setIsOpen(true);
      setAnimate("open");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* === Logo === */}
        <NavLink to="/" className="navbar-logo">
          <img src={logo} alt="Gaming Reviews logo" />
        </NavLink>

        {/* === Søk === */}
        <form onSubmit={handleSearch} className="navbar-search">
          <input
            type="text"
            placeholder="Søk etter spill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Søk</button>
        </form>

        <ThemeToggle position="bottom" />

        {/* === Navigasjonslenker === */}
        <ul className="navbar-links">
          <li>
            <NavLink to="/" end>
              Hjem
            </NavLink>
          </li>
          <li>
            <NavLink to="/nyheter">Nyheter</NavLink>
          </li>
          <li>
            <NavLink to="/favorites">Favoritter</NavLink>
          </li>
          <li>
            <NavLink to="/about">Om oss</NavLink>
          </li>
        </ul>

        {/* === Hamburger meny === */}
        <div className="navbar-hamburger" onClick={toggleMenu}>
          ☰
        </div>

        {/* === Dropdown meny === */}
        {isOpen && (
          <div className={`dropdown-menu ${animate}`}>
            <Link to="/playstation" onClick={() => toggleMenu()}>
              <img
                src={playstationIcon}
                alt="PlayStation"
                className="platform-icon"
              />
              Playstation
            </Link>
            <Link to="/pc" onClick={() => toggleMenu()}>
              <img src={steamIcon} alt="PC" className="platform-icon" />
              PC
            </Link>
            <Link to="/xbox" onClick={() => toggleMenu()}>
              <img src={xboxIcon} alt="Xbox" className="platform-icon" />
              Xbox
            </Link>
            <Link to="/nintendo" onClick={() => toggleMenu()}>
              <img
                src={nintendoLogo}
                alt="Nintendo"
                className="platform-icon"
              />
              Nintendo
            </Link>
            <Link to="/tech" onClick={() => toggleMenu()}>
              <img src={techLogo} className="platform-icon" />
              Tech
            </Link>
          </div>
        )}

        {/* === Admin ikon === */}
        <div className="navbar-admin">
          <Link to="/admin" title="Adminpanel" data-tooltip="Adminpanel">
            <User className="admin-icon" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
