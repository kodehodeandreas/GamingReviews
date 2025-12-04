import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import "./Home.css";
import IconSidebar from "../components/IconSidebar";

import psLogo from "../assets/platforms/playstation.png";
import steamLogo from "../assets/platforms/steam.png";
import xboxLogo from "../assets/platforms/xbox.svg";
import nintendoLogo from "../assets/platforms/nintendo.svg";
import techLogo from "../assets/platforms/tech.svg";

const platformIcons = {
  playstation: psLogo,
  pc: steamLogo,
  xbox: xboxLogo,
  nintendo: nintendoLogo,
  tech: techLogo,
};

function Home() {
  const [games, setGames] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [gotw, setGotw] = useState(null);

  const fetchGames = async (pageNumber = 1, search = "") => {
    setLoading(true);
    try {
      const url = search
        ? `https://api.rawg.io/api/games?key=fe169d60659940f4b367cdadc736b61c&search=${search}&page=${pageNumber}`
        : `https://api.rawg.io/api/games?key=fe169d60659940f4b367cdadc736b61c&page=${pageNumber}`;

      const res = await axios.get(url);

      if (pageNumber === 1) {
        setGames(res.data.results);
      } else {
        setGames((prev) => [...prev, ...res.data.results]);
      }

      setHasMore(res.data.next !== null);
    } catch (err) {
      console.error("Kunne ikke hente spill:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    let ignore = false;
    axios
      .get("https://gamereviews-not4.onrender.com/api/reviews/latest")
      .then((res) => {
        if (!ignore) setLatestPosts(res.data);
      })
      .catch((err) => console.error("Kunne ikke hente poster:", err));
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search");

    if (query) {
      setSearchTerm(query);
      setIsSearching(true);
      fetchGames(1, query);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setIsSearching(false);
    }
  }, [location.search]);

  useEffect(() => {
    axios
      .get("https://gamereviews-not4.onrender.com/api/reviews/gotw")
      .then((res) => setGotw(res.data))
      .catch(() => setGotw(null));
  }, []);

  useEffect(() => {
    if (location.pathname === "/") {
      setIsSearching(false);
      setSearchTerm("");
      fetchGames(1, "");
    }
  }, [location.pathname]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchGames(nextPage, searchTerm);
  };

  return (
    <div className="home">
      <IconSidebar />
      {!isSearching ? (
        <>
          <div className="platform-bar">
            <Link to="/playstation" className="platform-item">
              <img src={psLogo} alt="PlayStation" className="icon-ps" />
              <span>PlayStation</span>
            </Link>

            <Link to="/pc" className="platform-item">
              <img src={steamLogo} alt="PC / Steam" className="icon-steam" />
              <span>PC</span>
            </Link>

            <Link to="/xbox" className="platform-item">
              <img src={xboxLogo} alt="Xbox" className="icon-xbox" />
              <span>Xbox</span>
            </Link>

            <Link to="/nintendo" className="platform-item">
              <img
                src={nintendoLogo}
                alt="Nintendo"
                className="icon-nintendo"
              />
              <span>Nintendo</span>
            </Link>

            <Link to="/tech" className="platform-item">
              <img src={techLogo} className="icon-tech" alt="Tech" />
            </Link>
          </div>

          <h1 className="home-title">Siste Nytt</h1>
          <div className="latest-reviews-grid">
            {latestPosts.length === 0 ? (
              <p>Ingen poster enda</p>
            ) : (
              latestPosts.slice(0, 6).map((post) => (
                <div key={post._id} className="review-card-horizontal">
                  {/* Badge overlay */}
                  <div
                    className="home-badge"
                    style={{
                      background:
                        post.type === "gotw"
                          ? "#ff0000ea"
                          : post.type === "news"
                          ? "#009dffe0"
                          : "#ff7b00ea",
                    }}
                  >
                    {post.type === "gotw"
                      ? "🏆 Game of the Week"
                      : post.type === "news"
                      ? "📰 Nyhet"
                      : "⭐ Anmeldelse"}
                  </div>

                  <img
                    src={`${import.meta.env.BASE_URL}${post.imageUrl.replace(
                      /^\/+/,
                      ""
                    )}`}
                    alt={post.title}
                  />

                  <div className="review-card-content">
                    <div className="meta-row">
                      <small
                        className="post-type"
                        style={{
                          color:
                            post.type === "gotw"
                              ? "#ff4b4bff"
                              : post.type === "news"
                              ? "#00b3ff"
                              : "#ff7b00ff",
                        }}
                      >
                        {post.type === "gotw"
                          ? "Game of the Week"
                          : post.type === "news"
                          ? "Nyhet"
                          : "Anmeldelse"}
                      </small>

                      <div className="platform-icon-row">
                        {post.platforms?.map((p) => (
                          <img
                            key={p}
                            src={platformIcons[p]}
                            alt={p}
                            className="platform-badge"
                          />
                        ))}
                      </div>
                    </div>

                    <Link
                      to={`/review/${post._id}`}
                      className="review-title-link"
                    >
                      <h3>{post.title}</h3>
                    </Link>

                    <p className="latest-summary">
                      {post.summary || post.content.slice(0, 100)}
                    </p>

                    <div className="latest-footer-row">
                      <Link
                        to={`/review/${post._id}`}
                        className="read-more-link latest-read-more"
                      >
                        Les mer →
                      </Link>

                      <div className="latest-meta-right">
                        <div className="platform-icon-row">
                          {post.platforms?.map((p) => (
                            <img
                              key={p}
                              src={platformIcons[p]}
                              alt={p}
                              className="platform-badge"
                            />
                          ))}
                        </div>

                        <span className="latest-date">
                          {new Date(post.date).toLocaleDateString("no-NO")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* === GAME OF THE WEEK === */}
          {gotw && (
            <div className="gotw-section">
              <div className="gotw-card">
                <img
                  className="gotw-image"
                  src={`${import.meta.env.BASE_URL}${gotw.imageUrl.replace(
                    /^\/+/,
                    ""
                  )}`}
                  alt={gotw.title}
                />

                <div className="gotw-content">
                  <h2>Game of the Week</h2>

                  {/* Platform Row for GOTW */}
                  <div className="gotw-meta-row">
                    <div className="platform-icon-row">
                      {gotw.platforms?.map((p) => (
                        <img
                          key={p}
                          src={platformIcons[p]}
                          alt={p}
                          className="platform-badge"
                        />
                      ))}
                    </div>

                    <span className="gotw-date">
                      {new Date(gotw.date).toLocaleDateString("no-NO")}
                    </span>
                  </div>

                  <h3>{gotw.title}</h3>

                  <p>{gotw.summary || gotw.content.slice(0, 200) + "..."}</p>

                  <Link to={`/review/${gotw._id}`} className="gotw-readmore">
                    Les mer →
                  </Link>
                </div>
              </div>
            </div>
          )}

          <h2 className="home-subtitle">Alle spill</h2>

          <div className="game-grid">
            {games.length === 0 && !loading && <p>Ingen spill funnet</p>}
            {games.map((game) => (
              <Link to={`/game/${game.id}`} key={game.id} className="game-card">
                {game.background_image ? (
                  <img src={game.background_image} alt={game.name} />
                ) : (
                  <div className="placeholder-img">Ingen bilde</div>
                )}
                <h2>{game.name}</h2>
              </Link>
            ))}
          </div>

          <div className="load-more-container">
            {hasMore ? (
              <button onClick={loadMore} disabled={loading}>
                {loading ? "Laster..." : "Last inn flere"}
              </button>
            ) : (
              <p>Ingen flere spill å laste inn</p>
            )}
          </div>
        </>
      ) : (
        <>
          <h1 className="home-title">Søkeresultater for “{searchTerm}”</h1>
          {isSearching && (
            <button
              className="clear-search"
              onClick={() => window.location.assign("/")}
            >
              Tøm søk
            </button>
          )}
          <div className="game-grid">
            {loading ? (
              <p>Laster...</p>
            ) : games.length === 0 ? (
              <p>Ingen resultater funnet.</p>
            ) : (
              games.map((game) => (
                <Link
                  to={`/game/${game.id}`}
                  key={game.id}
                  className="game-card"
                >
                  {game.background_image ? (
                    <img src={game.background_image} alt={game.name} />
                  ) : (
                    <div className="placeholder-img">Ingen bilde</div>
                  )}
                  <h2>{game.name}</h2>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
