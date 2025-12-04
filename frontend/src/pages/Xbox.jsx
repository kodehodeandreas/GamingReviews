import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Playstation.css"; // Gjenbruker layout

const withBase = (path) => {
  if (!path) return "";
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
};

function Xbox() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://gamereviews-not4.onrender.com/api/reviews")
      .then((res) => {
        const filtered = res.data.filter((p) =>
          p.platforms?.map((pl) => pl.toLowerCase()).includes("xbox")
        );
        setPosts(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Feil ved henting av Xbox-innhold:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="playstation-page">
      <div className="playstation-header">
        <h1>Xbox</h1>
        <p>Siste nytt, anmeldelser og spillstoff relatert til Xbox.</p>
      </div>

      {loading && <p className="ps-empty">Laster Xbox-innhold...</p>}

      {!loading && posts.length === 0 && (
        <p className="ps-empty">Ingen Xbox-artikler enda.</p>
      )}

      <div className="playstation-grid">
        {posts.map((post) => (
          <Link to={`/review/${post._id}`} key={post._id} className="ps-card">
            <img src={withBase(post.imageUrl)} alt={post.title} />

            <div className="ps-card-content">
              <h3>{post.title}</h3>
              <p>
                {post.summary && post.summary.length > 0
                  ? post.summary
                  : post.content.slice(0, 140)}
                ...
              </p>
              <span className="ps-read-more">Les mer →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Xbox;
