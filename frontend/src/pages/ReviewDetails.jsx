import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "./ReviewDetails.css";

const withBase = (path) => {
  if (!path) return "";
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
};

function ReviewDetails() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

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
