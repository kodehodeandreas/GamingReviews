import { NavLink } from "react-router-dom";
import "./Footer.css";

import psIcon from "../assets/platforms/playstation.png";
import steamIcon from "../assets/platforms/steam.png";
import xboxIcon from "../assets/platforms/xbox.svg";
import nintendoIcon from "../assets/platforms/nintendo.svg";
import techIcon from "../assets/platforms/tech.svg";

import instagram from "../assets/icons/instagram.svg";
import facebook from "../assets/icons/facebook.svg";
import youtube from "../assets/icons/youtube.svg";
import xlogo from "../assets/icons/x.svg";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h2>Gaming Reviews</h2>
          <p>Din kilde til ærlige spillanmeldelser</p>
        </div>

        <ul className="footer-links">
          <li>
            <NavLink to="/">Hjem</NavLink>
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

        {/* ===== Plattform-ikoner ===== */}
        <div className="footer-platforms">
          <NavLink to="/playstation">
            <img src={psIcon} alt="PlayStation" />
          </NavLink>
          <NavLink to="/pc">
            <img src={steamIcon} alt="PC / Steam" />
          </NavLink>
          <NavLink to="/xbox">
            <img src={xboxIcon} alt="Xbox" />
          </NavLink>
          <NavLink to="/nintendo">
            <img src={nintendoIcon} alt="Nintendo" />
          </NavLink>
          <NavLink to="/tech">
            <img src={techIcon} alt="Tech" />
          </NavLink>
        </div>

        {/* ===== Copyright + SoMe ===== */}
        <div className="footer-right">
          <p>© {new Date().getFullYear()} GamingReviews</p>

          <div className="footer-social-icons">
            <img src={instagram} alt="Instagram" />
            <img src={facebook} alt="Facebook" />
            <img src={xlogo} alt="X" />
            <img src={youtube} alt="YouTube" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
