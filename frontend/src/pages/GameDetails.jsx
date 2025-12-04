import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./GameDetails.css";
import { Link } from "react-router-dom";

function GameDetails() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");

  useEffect(() => {
    axios
      .get(
        `https://api.rawg.io/api/games/${id}?key=fe169d60659940f4b367cdadc736b61c`
      )
      .then((res) => setGame(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  // Hent reviews fra backend
  useEffect(() => {
    axios
      .get(`https://gamereviews-not4.onrender.com/api/reviews/game/${id}`)
      .then((res) => setReviews(res.data))
      .catch((err) => console.error("Feil ved henting av reviews:", err));
  }, [id]);

  if (!game) return <p>Laster...</p>;

  return (
    <div className="game-details">
      <h1>{game.name}</h1>
      <img src={game.background_image} alt={game.name} className="game-image" />
      <p>{game.description_raw}</p>

      <section className="reviews">
        <h2>Anmeldelser</h2>

        <div className="review-list">
          {reviews.length === 0 ? (
            <p>Ingen anmeldelser enda</p>
          ) : (
            reviews.map((r, i) => (
              <div key={r._id} className="review-item">
                <h3>{r.title}</h3>
                <p>{r.summary || r.content.slice(0, 200)}...</p>
                <small>{new Date(r.date).toLocaleDateString()}</small>
                <Link to={`/review/${r._id}`} className="read-more">
                  Les mer →
                </Link>
                Les mer →
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default GameDetails;
