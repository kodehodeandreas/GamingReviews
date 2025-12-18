import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "./ReviewDetails.css";

// Midlertidig admin-sjekk (frontend-only)
const isAdmin =
  import.meta.env.VITE_IS_ADMIN === "true" ||
  localStorage.getItem("isAdmin") === "true";

const withBase = (path) => {
  if (!path) return "";
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
};

const timeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const seconds = Math.floor((now - past) / 1000);

  if (seconds < 60) return "akkurat nå";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return `for ${minutes} minutt${minutes > 1 ? "er" : ""} siden`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `for ${hours} time${hours > 1 ? "r" : ""} siden`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "i går";
  if (days < 7) return `for ${days} dager siden`;

  return past.toLocaleDateString("no-NO");
};

function ReviewDetails() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [author, setAuthor] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (!selectedImage || !review?.galleryImages?.length) return;

    const handleKey = (e) => {
      const currentIndex = review.galleryImages.indexOf(selectedImage);
      if (e.key === "ArrowRight") {
        const next =
          review.galleryImages[
            (currentIndex + 1) % review.galleryImages.length
          ];
        setSelectedImage(next);
      } else if (e.key === "ArrowLeft") {
        const prev =
          review.galleryImages[
            (currentIndex - 1 + review.galleryImages.length) %
              review.galleryImages.length
          ];
        setSelectedImage(prev);
      } else if (e.key === "Escape") {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedImage, review]);

  useEffect(() => {
    axios
      .get(`https://gamereviews-not4.onrender.com/api/reviews/${id}`)
      .then((res) => {
        if (!Array.isArray(res.data.galleryImages)) {
          res.data.galleryImages = res.data.galleryImages
            ? [res.data.galleryImages]
            : [];
        }
        setReview(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Feil ved henting av review:", err);
        setLoading(false);
      });
  }, [id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!author.trim() || !commentText.trim()) {
      alert("Navn og kommentar må fylles ut");
      return;
    }

    try {
      setCommentLoading(true);

      const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const res = await axios.post(`${API}/api/reviews/${id}/comments`, {
        author,
        text: commentText,
      });

      // Backend returnerer oppdatert review
      setReview(res.data);

      // Reset form
      setAuthor("");
      setCommentText("");
    } catch (err) {
      console.error("Feil ved posting av kommentar:", err);
      alert("Kunne ikke legge til kommentar");
    } finally {
      setCommentLoading(false);
    }
  };

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Vil du slette denne kommentaren?")) return;

    try {
      const res = await axios.delete(
        `${API}/api/reviews/${review._id}/comments/${commentId}`
      );

      // Oppdater review lokalt etter sletting
      setReview(res.data);
    } catch (err) {
      console.error("Feil ved sletting av kommentar:", err);
      alert("Kunne ikke slette kommentaren");
    }
  };

  if (loading) return <p className="loading">Laster anmeldelse...</p>;
  if (!review) return <p className="error">Fant ikke anmeldelsen.</p>;

  return (
    <div className="review-details">
      {/* === HEADER === */}
      <div className="review-header">
        <h1>{review.title}</h1>
      </div>
      {review.summary && <p className="review-summary">{review.summary}</p>}

      {/* === BILDE === */}
      <img
        src={withBase(review.imageUrl)}
        alt={review.title}
        className="review-image"
      />
      <small className="review-date">
        Publisert: {new Date(review.date).toLocaleDateString("no-NO")}
      </small>
      {review.secondaryImageUrl && (
        <img
          src={review.secondaryImageUrl}
          alt={`${review.title} ekstra bilde`}
          className="review-secondary-image"
        />
      )}

      {/* === SELVE ANMELDELSEN === */}
      <div className="review-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            p: ({ node, children }) => {
              // Hvis p inneholder block-elementer, returner bare children
              if (
                node.children?.some(
                  (child) =>
                    child.tagName === "figure" ||
                    child.tagName === "youtube" ||
                    child.tagName === "section" ||
                    child.tagName === "hr"
                )
              ) {
                return <>{children}</>;
              }

              return <p>{children}</p>;
            },
            img: ({ alt, src }) => (
              <figure className="review-image-block">
                <img
                  src={withBase(src)}
                  alt={alt}
                  className="review-inline-image"
                />
                {alt && (
                  <figcaption className="review-image-caption">
                    {alt}
                  </figcaption>
                )}
              </figure>
            ),

            youtube: ({ node, ...props }) => (
              <div className="review-video-block">
                <iframe
                  src={`https://www.youtube.com/embed/${props.id}`}
                  title="YouTube video"
                  loading="lazy"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ),
          }}
        >
          {review.content}
        </ReactMarkdown>
      </div>

      {/* === PROS / CONS / RATING === */}
      {review.type === "review" &&
        (review.pros?.length > 0 ||
          review.cons?.length > 0 ||
          review.rating) && (
          <div className="pros-cons-section">
            {review.pros?.length > 0 && (
              <div className="pros">
                <h3>Pros</h3>
                <ul>
                  {review.pros.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {review.cons?.length > 0 && (
              <div className="cons">
                <h3>Cons</h3>
                <ul>
                  {review.cons.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {review.rating && (
              <div className="rating-box">
                <span className="rating-score">{review.rating}</span>
                <p>av 10</p>
              </div>
            )}
          </div>
        )}

      {/* === GALLERI === */}
      {review.galleryImages?.length > 0 && (
        <div className="review-gallery">
          <h2>Galleri</h2>

          <div className="gallery-container">
            <button
              className="gallery-arrow left"
              onClick={() => {
                document.querySelector(".gallery-images").scrollBy({
                  left: -300,
                  behavior: "smooth",
                });
              }}
            >
              ❮
            </button>

            <div className="gallery-images">
              {review.galleryImages.map((img, index) => (
                <img
                  src={withBase(img)}
                  alt={`${review.title} bilde ${index + 1}`}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>

            <button
              className="gallery-arrow right"
              onClick={() => {
                document.querySelector(".gallery-images").scrollBy({
                  left: 300,
                  behavior: "smooth",
                });
              }}
            >
              ❯
            </button>
          </div>

          {/* MODAL */}
          {selectedImage && (
            <div
              className="modal-overlay show"
              onClick={() => setSelectedImage(null)}
            >
              <div
                className="modal-content zoom-in"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  key={selectedImage}
                  src={withBase(selectedImage)}
                  alt="forstørret"
                  className="modal-image fade-image"
                />

                {/* Lukk-knapp */}
                <button
                  className="close-modal"
                  onClick={() => setSelectedImage(null)}
                >
                  ✕
                </button>

                {/* Piler for neste/forrige */}
                <button
                  className="modal-arrow left"
                  onClick={() => {
                    const currentIndex =
                      review.galleryImages.indexOf(selectedImage);
                    const prev =
                      review.galleryImages[
                        (currentIndex - 1 + review.galleryImages.length) %
                          review.galleryImages.length
                      ];
                    setSelectedImage(prev);
                  }}
                >
                  ❮
                </button>

                <button
                  className="modal-arrow right"
                  onClick={() => {
                    const currentIndex =
                      review.galleryImages.indexOf(selectedImage);
                    const next =
                      review.galleryImages[
                        (currentIndex + 1) % review.galleryImages.length
                      ];
                    setSelectedImage(next);
                  }}
                >
                  ❯
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* === KOMMENTARER === */}
      <div className="comments-section">
        <h2>Kommentarer</h2>

        <form className="comment-form" onSubmit={handleSubmitComment}>
          <input
            type="text"
            placeholder="Navn"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />

          <textarea
            placeholder="Skriv en kommentar..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            required
          />

          <button type="submit" disabled={commentLoading}>
            {commentLoading ? "Sender..." : "Legg til kommentar"}
          </button>
        </form>

        {!review.comments || review.comments.length === 0 ? (
          <p className="no-comments">Ingen kommentarer enda.</p>
        ) : (
          <ul className="comments-list">
            {review.comments.map((comment) => (
              <li
                key={comment._id}
                className={`comment-item ${comment.isAdmin ? "admin" : ""}`}
              >
                <div className="comment-header">
                  <strong className="comment-author">
                    {comment.author}
                    {comment.isAdmin && (
                      <span className="admin-badge">ADMIN</span>
                    )}
                  </strong>

                  <div className="comment-meta">
                    <span className="comment-date">
                      {timeAgo(comment.date)}
                    </span>

                    {isAdmin && (
                      <button
                        className="comment-delete"
                        onClick={() => handleDeleteComment(comment._id)}
                        title="Slett kommentar"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <p className="comment-text">{comment.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* === TILBAKEKNAPP === */}
      <div className="back-btn-container">
        <Link to="/nyheter" className="back-btn">
          ← Tilbake til Nyheter
        </Link>
      </div>
    </div>
  );
}

export default ReviewDetails;
