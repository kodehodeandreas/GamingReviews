import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./AdminPanel.css";

function AdminPanel() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [password, setPassword] = useState("");

  // === Login-funksjon ===
  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "https://gamereviews-not4.onrender.com/api/admin/login",
        {
          password,
        }
      );

      localStorage.setItem("token", res.data.token);
      setIsLoggedIn(true);
      setPassword("");
      alert("✅ Innlogging vellykket!");
    } catch (err) {
      alert("❌ Feil passord!");
    }
  };

  // === Logout-knapp ===
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  // === Hent anmeldelser (kun etter login) ===
  useEffect(() => {
    if (!isLoggedIn) return;

    const token = localStorage.getItem("token");

    axios
      .get(
        "https://gamereviews-not4.onrender.com/api/reviews?page=1&limit=200",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        setReviews(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Feil ved henting av anmeldelser:", err);
        setLoading(false);
      });
  }, [isLoggedIn]);

  // === Slett anmeldelse (beskyttet rute) ===
  const handleDelete = async (id) => {
    if (!window.confirm("Er du sikker på at du vil slette dette innlegget?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://gamereviews-not4.onrender.com
/api/reviews/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReviews((prev) => prev.filter((r) => r._id !== id));
      alert("✅ Innlegget ble slettet!");
    } catch (err) {
      console.error("Feil ved sletting:", err);
      alert("❌ Kunne ikke slette innlegget.");
    }
  };

  // === Hvis ikke logget inn – vis login-panel ===
  if (!isLoggedIn) {
    return (
      <div className="login-panel">
        <h2>Admin login</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <input
            type="password"
            placeholder="Skriv admin-passord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Logg inn</button>
        </form>
      </div>
    );
  }

  // === Laster ===
  if (loading) return <p>Laster adminpanel...</p>;

  // === Hvis innlogget – vis admin-siden ===
  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Administrasjon</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logg ut
        </button>
      </div>

      <div className="admin-actions">
        <Link to="/admin/newreview" className="btn">
          ➕ Ny anmeldelse
        </Link>
      </div>

      <table>
        <thead>
          <tr>
            <th>Tittel</th>
            <th>Type</th>
            <th>Publisert</th>
            <th>Handlinger</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review._id}>
              <td>{review.title}</td>
              <td>{review.type}</td>
              <td>{new Date(review.date).toLocaleDateString("no-NO")}</td>
              <td>
                <Link to={`/admin/edit/${review._id}`} className="edit-btn">
                  ✏️ Rediger
                </Link>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(review._id)}
                >
                  🗑️ Slett
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPanel;
