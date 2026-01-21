import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminNewReview.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminNewReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [feedSummary, setFeedSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [secondaryImageUrl, setSecondaryImageUrl] = useState("");
  const [type, setType] = useState("review");
  const [platforms, setPlatforms] = useState([]);
  const [gameId, setGameId] = useState("");

  const [preview, setPreview] = useState("");
  const [pros, setPros] = useState([""]);
  const [cons, setCons] = useState([""]);
  const [rating, setRating] = useState("");
  const [status, setStatus] = useState({ loading: false, message: "" });
  const [galleryImages, setGalleryImages] = useState([]);
  const [editorsPick, setEditorsPick] = useState(false);

  // === HENT EKSISTERENDE REVIEW HVIS REDIGERING ===
  useEffect(() => {
    if (id) {
      axios
        .get(`${API}/api/reviews/${id}`)
        .then((res) => {
          const r = res.data;
          setTitle(r.title);
          setSummary(r.summary || "");
          setFeedSummary(r.feedSummary || "");
          setContent(r.content);
          setImageUrl(r.imageUrl || "");
          setSecondaryImageUrl(r.secondaryImageUrl || "");
          setType(r.type || "review");
          setPlatforms(r.platforms || []);
          setGameId(r.gameId || "");
          setPros(r.pros?.length ? r.pros : [""]);
          setCons(r.cons?.length ? r.cons : [""]);
          setRating(r.rating || "");
          setPreview(r.imageUrl || "");
          setGalleryImages(r.galleryImages || []);
          setEditorsPick(r.editorsPick || false);
        })
        .catch((err) => console.error("Feil ved henting av review:", err));
    }
  }, [id]);

  // === LAGRE NY / OPPDATER ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Du må være innlogget for å publisere eller redigere.");
      return;
    }

    const newReview = {
      title,
      summary,
      feedSummary,
      content,
      imageUrl,
      secondaryImageUrl,
      type,
      platforms,
      gameId,
      pros: pros.filter((p) => p.trim() !== ""),
      cons: cons.filter((c) => c.trim() !== ""),
      rating: rating ? parseFloat(rating) : null,
      galleryImages,
      editorsPick,
    };

    try {
      setStatus({ loading: true, message: "" });

      if (id) {
        // OPPDATER
        await axios.put(`${API}/api/reviews/${id}`, newReview, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatus({ loading: false, message: "✅ Anmeldelsen ble oppdatert!" });
      } else {
        // NY REVIEW
        await axios.post(`${API}/api/reviews`, newReview, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatus({ loading: false, message: "✅ Innlegget ble publisert!" });
      }

      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      console.error("Feil ved opplasting:", err);
      setStatus({
        loading: false,
        message: "❌ Noe gikk galt under lagring. Prøv igjen.",
      });
    }
  };

  const handleAddPros = () => setPros([...pros, ""]);
  const handleAddCons = () => setCons([...cons, ""]);

  const PLATFORM_OPTIONS = ["playstation", "pc", "xbox", "nintendo", "tech"];

  return (
    <div className="admin-new-review">
      <h1>{id ? "✏️ Rediger anmeldelse" : "✍️ Ny anmeldelse eller nyhet"}</h1>

      <form onSubmit={handleSubmit}>
        <label>Tittel</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Skriv inn tittel..."
          required
        />

        <label>Kort oppsummering</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Skriv en kort oppsummering..."
          rows={2}
        />

        <label>Kort tekst til feed (valgfritt)</label>
        <textarea
          value={feedSummary}
          onChange={(e) => setFeedSummary(e.target.value)}
          placeholder="Kortere tekst som kun vises i 'Flere saker'-feeden..."
          rows={2}
        />

        <label>Innhold</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Skriv hele teksten her (Markdown støttes)"
          rows={10}
          required
        />

        <label>Hovedbilde (URL)</label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => {
            let value = e.target.value;

            if (value.startsWith("images/")) {
              value = "/" + value;
            }

            setImageUrl(value);
            setPreview(value);
          }}
          placeholder="Lim inn bilde-URL"
        />

        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Forhåndsvisning" />
          </div>
        )}

        <label>Sekundært bilde (valgfritt)</label>
        <input
          type="text"
          value={secondaryImageUrl}
          onChange={(e) => setSecondaryImageUrl(e.target.value)}
          placeholder="Lim inn sekundær bilde-URL"
        />

        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="review">Anmeldelse</option>
          <option value="news">Nyhet</option>
          <option value="gotw">Game of the Week</option>
        </select>

        <label className="editors-pick-label">
          <input
            type="checkbox"
            checked={editorsPick}
            onChange={(e) => setEditorsPick(e.target.checked)}
          />
          ⭐ Sett som Editor’s Pick
        </label>

        <label>Plattformer</label>
        <div className="platform-checkboxes">
          {PLATFORM_OPTIONS.map((platform) => (
            <label key={platform} className="platform-option">
              <input
                type="checkbox"
                checked={platforms.includes(platform)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setPlatforms([...platforms, platform]);
                  } else {
                    setPlatforms(platforms.filter((p) => p !== platform));
                  }
                }}
              />
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </label>
          ))}
        </div>

        {(type === "review" || type === "gotw") && (
          <>
            <label>Pros</label>
            {pros.map((p, i) => (
              <input
                key={i}
                type="text"
                value={p}
                onChange={(e) => {
                  const newPros = [...pros];
                  newPros[i] = e.target.value;
                  setPros(newPros);
                }}
                placeholder="Skriv Pro..."
              />
            ))}
            <button type="button" onClick={handleAddPros}>
              ➕ Legg til Pro
            </button>

            <label>Cons</label>
            {cons.map((c, i) => (
              <input
                key={i}
                type="text"
                value={c}
                onChange={(e) => {
                  const newCons = [...cons];
                  newCons[i] = e.target.value;
                  setCons(newCons);
                }}
                placeholder="Skriv Con..."
              />
            ))}
            <button type="button" onClick={handleAddCons}>
              ➕ Legg til Con
            </button>

            <label>Rating (0–10)</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="8.5"
            />
          </>
        )}

        <label>Galleri-bilder</label>
        {galleryImages.map((img, i) => (
          <div key={i} className="gallery-input-row">
            <input
              type="text"
              value={img}
              onChange={(e) => {
                const newImgs = [...galleryImages];
                newImgs[i] = e.target.value;
                setGalleryImages(newImgs);
              }}
              placeholder={`Bilde ${i + 1} URL`}
            />
            <button
              type="button"
              className="remove-img-btn"
              onClick={() =>
                setGalleryImages(
                  galleryImages.filter((_, index) => index !== i)
                )
              }
            >
              ✖
            </button>
          </div>
        ))}

        <button
          type="button"
          className="add-img-btn"
          onClick={() => setGalleryImages([...galleryImages, ""])}
        >
          ➕ Legg til bilde
        </button>

        {galleryImages.length > 0 && (
          <div className="gallery-preview">
            {galleryImages.map(
              (img, i) =>
                img && (
                  <div key={i} className="gallery-thumb">
                    <img src={img} alt={`Galleri ${i + 1}`} />
                  </div>
                )
            )}
          </div>
        )}

        <label>RAWG Game ID (valgfritt)</label>
        <input
          type="text"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          placeholder="f.eks. 3328 for The Witcher 3"
        />

        <button type="submit" disabled={status.loading}>
          {status.loading ? "Lagrer..." : id ? "Oppdater" : "Publiser"}
        </button>
      </form>

      {status.message && (
        <p
          className={`status-msg ${
            status.message.startsWith("✅") ? "success" : "error"
          }`}
        >
          {status.message}
        </p>
      )}
    </div>
  );
}

export default AdminNewReview;
