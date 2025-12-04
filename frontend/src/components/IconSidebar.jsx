// src/components/IconSidebar.jsx
import "./IconSidebar.css";
import { Link } from "react-router-dom";

// Import av ikoner
import instagram from "../assets/icons/instagram.svg";
import facebook from "../assets/icons/facebook.svg";
import youtube from "../assets/icons/youtube.svg";
import xlogo from "../assets/icons/x.svg";
import amd from "../assets/icons/amd.svg";
import nvidia from "../assets/icons/nvidia.svg";
import steelseries from "../assets/icons/steelseries.svg";

function IconSidebar() {
  return (
    <div className="icon-sidebar">
      {/* Sosiale medier */}
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
        <img src={instagram} alt="Instagram" />
      </a>
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
        <img src={facebook} alt="Facebook" />
      </a>
      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
        <img src={youtube} alt="YouTube" />
      </a>
      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
        <img src={xlogo} alt="X" />
      </a>

      <div className="sidebar-divider" />

      {/* Hardware-merker */}
      <a href="#" title="AMD">
        <img src={amd} alt="AMD" />
      </a>
      <a href="#" title="NVIDIA">
        <img src={nvidia} alt="NVIDIA" />
      </a>
      <a href="#" title="SteelSeries">
        <img src={steelseries} alt="SteelSeries" />
      </a>
    </div>
  );
}

export default IconSidebar;
