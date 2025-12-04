import { useEffect, useState } from "react";
import axios from "axios";
import "./News.css";
import { Link } from "react-router-dom";

import psLogo from "../assets/platforms/playstation.png";
import steamLogo from "../assets/platforms/steam.png";
import xboxLogo from "../assets/platforms/xbox.svg";
import nintendoLogo from "../assets/platforms/nintendo.svg";
import techLogo from "../assets/platforms/tech.svg";

const withBase = (path) => {
  if (!path) return "";
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
};

const platformIcons = {
  playstation: psLogo,
  pc: steamLogo,
  xbox: xboxLogo,
  nintendo: nintendoLogo,
  tech: techLogo,
};

function News() {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const REVIEWS_PER_PAGE = 10;

  // Hent anmeldelser
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://gamereviews-not4.onrender.com/api/reviews?page=${page}&limit=${REVIEWS_PER_PAGE}`
        );

        if (res.data.length < REVIEWS_PER_PAGE) {
          setHasMore(false);
        }

        // Hvis side 1 → erstatt gamle reviews, ikke legg til
        if (page === 1) {
          setReviews(res.data);
        } else {
          setReviews((prev) => [...prev, ...res.data]);
        }
      } catch (err) {
        console.error("Kunne ikke hente reviews:", err);
      }
      setLoading(false);
    };

    fetchReviews();
  }, [page]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="news-page">
      <h1 className="news-title">Latest News & Reviews</h1>

      <div className="news-grid">
        {reviews.length === 0 && !loading && (
          <p className="empty-msg">Ingen anmeldelser tilgjengelig.</p>
        )}

        {reviews.map((review) => (
          <Link
            to={`/review/${review._id}`}
            key={review._id}
            className="news-card"
          >
            <img src={withBase(review.imageUrl)} alt={review.title} />

            <div
              className="news-badge"
              style={{
                background:
                  review.type === "gotw"
                    ? "#ff0000d7"
                    : review.type === "news"
                    ? "#009dffe1"
                    : "#ff7b00d6",
              }}
            >
              {review.type === "gotw"
                ? "🏆 Game of the Week"
                : review.type === "news"
                ? "📰 Nyhet"
                : "⭐ Anmeldelse"}
            </div>
            <div className="news-card-content">
              <h2>{review.title}</h2>
              <p className="news-summary">
                {review.summary || `${review.content.slice(0, 180)}...`}
              </p>
              <div className="news-footer">
                <small>
                  {new Date(review.date).toLocaleDateString("no-NO")}
                </small>

                <div className="platform-icon-row-news">
                  {review.platforms?.map((p) => (
                    <img
                      key={p}
                      src={platformIcons[p]}
                      alt={p}
                      className="platform-badge"
                    />
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="load-more-container">
          <button onClick={loadMore} disabled={loading}>
            {loading ? "Laster..." : "Last inn flere"}
          </button>
        </div>
      )}
    </div>
  );
}

export default News;
