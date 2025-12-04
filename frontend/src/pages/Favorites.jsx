import { useEffect, useState } from "react";
import axios from "axios";
import "./Favorites.css";

const withBase = (path) => {
  if (!path) return "";

  // Hvis ekstern URL → ikke rør den
  if (path.startsWith("http")) return path;

  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
};

function Favorites() {
  const fallbackImage = "/images/game-placeholder.jpg";

  const top20Names = [
    { name: "The Witcher 3: Wild Hunt", rating: 10 },
    { name: "Baldur's Gate 3", rating: 10 },
    { name: "Red Dead Redemption 2", rating: 10 },
    { name: "Elden Ring", rating: 10 },
    { name: "Cyberpunk 2077", rating: 9.7 },
    { name: "Sekiro: Shadows Die Twice", rating: 9.6 },
    { name: "God of War Ragnarök", rating: 9.5 },
    { name: "Metal Gear Solid V: The Phantom Pain", rating: 9.5 },
    { name: "Mass Effect Legendary Edition", rating: 9.5 },
    { name: "Batman: Arkham City", rating: 9.5 },
    { name: "Subnautica", rating: 9.3 },
    { name: "Dishonored 2", rating: 9.0 },
    { name: "Death Stranding 2", rating: 9.0 },
    { name: "Black Myth: Wukong", rating: 8.9 },
    { name: "Ghost of Tsushima", rating: 8.8 },
    { name: "Tom Clancy's The Division 2", rating: 8.7 },
    { name: "Assassin's Creed Shadows", rating: 8.6 },
    { name: "Dragon's Dogma 2", rating: 8.6 },
    { name: "Dune: Awakening", rating: 8.6 },
    { name: "The Last Guardian", rating: 8.3 },
  ];

  const underratedNames = [
    { name: "Sleeping Dogs", rating: 9.0 },
    { name: "Days Gone", rating: 8.5 },
    { name: "Rise of the Ronin", rating: 8.5 },
    { name: "Avatar: Frontiers of Pandora", rating: 8.5 },
    { name: "MotoGP 24", rating: 8.5 },
    { name: "MLB The Show 24", rating: 8.8 },
    { name: "Sniper Elite 5", rating: 8.4 },
    { name: "Conan Exiles", rating: 8.0 },
    { name: "Mad Max", rating: 8.0 },
    { name: "Predator: Hunting Grounds", rating: 7.7 },
  ];

  // alternative søk for spill RAWG bommer på
  const alternativeNames = {
    "Baldur's Gate 3": ["Baldur's Gate III"],
    "Mad Max": ["Mad Max (2015)"],
    "Death Stranding 2": ["Death Stranding 2 On The Beach"],
    "God of War Ragnarök": ["God of War Ragnarok"],
    "The Last Guardian": ["The Last Guardian"],
  };

  const [top20, setTop20] = useState([]);
  const [underrated, setUnderrated] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = async (list) => {
    const key = "fe169d60659940f4b367cdadc736b61c";

    const promises = list.map(async (item) => {
      try {
        // Første forsøk
        const res = await axios.get(
          `https://api.rawg.io/api/games?key=${key}&search=${encodeURIComponent(
            item.name
          )}&search_exact=true`
        );

        let game = res.data.results[0];

        //  alternative navn
        if ((!game || !game.background_image) && alternativeNames[item.name]) {
          for (const alt of alternativeNames[item.name]) {
            const altRes = await axios.get(
              `https://api.rawg.io/api/games?key=${key}&search=${encodeURIComponent(
                alt
              )}&search_exact=true`
            );
            if (altRes.data.results[0]) {
              game = altRes.data.results[0];
              break;
            }
          }
        }

        // treff eller fallback
        return game
          ? {
              id: game.id,
              name: game.name,
              image: game.background_image || fallbackImage,
              rating: item.rating,
            }
          : {
              id: null,
              name: item.name,
              image: fallbackImage,
              rating: item.rating,
            };
      } catch {
        return {
          id: null,
          name: item.name,
          image: fallbackImage,
          rating: item.rating,
        };
      }
    });

    const results = await Promise.all(promises);
    return results;
  };

  useEffect(() => {
    const loadData = async () => {
      const cachedTop = localStorage.getItem("top20Favorites");
      const cachedUnder = localStorage.getItem("underratedFavorites");

      if (cachedTop && cachedUnder) {
        setTop20(JSON.parse(cachedTop));
        setUnderrated(JSON.parse(cachedUnder));
        setLoading(false);
        return;
      }

      const [top, under] = await Promise.all([
        fetchGames(top20Names),
        fetchGames(underratedNames),
      ]);

      setTop20(top);
      setUnderrated(under);
      localStorage.setItem("top20Favorites", JSON.stringify(top));
      localStorage.setItem("underratedFavorites", JSON.stringify(under));
      setLoading(false);
    };

    loadData();
  }, []);

  const clearCache = () => {
    localStorage.removeItem("top20Favorites");
    localStorage.removeItem("underratedFavorites");
    window.location.reload();
  };

  if (loading) return <p className="loading">Laster favoritter...</p>;

  return (
    <div className="favorites">
      <h1 className="favorites-title">Mine Favoritter 🎮</h1>

      <div className="favorites-wrapper">
        <section className="favorites-section">
          <h2>Top 20 Spill</h2>
          <div className="favorites-grid">
            {top20.map((game, index) => (
              <div key={game.name} className="favorite-card">
                <span className="rank">{index + 1}</span>
                <img
                  src={withBase(game.image) || fallbackImage}
                  alt={game.name}
                />
                <div className="favorite-card-content">
                  <h3>{game.name}</h3>
                  <p className="rating">⭐ {game.rating.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="favorites-section underrated">
          <h2>Undervurderte</h2>
          <div className="favorites-grid">
            {underrated.map((game) => (
              <div key={game.name} className="favorite-card">
                <img
                  src={withBase(game.image) || fallbackImage}
                  alt={game.name}
                />
                <div className="favorite-card-content">
                  <h3>{game.name}</h3>
                  <p className="rating">⭐ {game.rating.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Favorites;
