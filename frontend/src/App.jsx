import { HashRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import GameDetails from "./pages/GameDetails";
import News from "./pages/News";
import Favorites from "./pages/Favorites";
import About from "./pages/About";
import ReviewDetails from "./pages/ReviewDetails";

import AdminPanel from "./pages/AdminPanel";
import AdminNewReview from "./pages/AdminNewReview";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Playstation from "./pages/Playstation";
import PC from "./pages/PC";
import Xbox from "./pages/Xbox";
import Nintendo from "./pages/Nintendo";
import Tech from "./pages/Tech";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nyheter" element={<News />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/about" element={<About />} />
        <Route path="/review/:id" element={<ReviewDetails />} />
        <Route path="/game/:id" element={<GameDetails />} />
        <Route path="/playstation" element={<Playstation />} />
        <Route path="/pc" element={<PC />} />
        <Route path="/xbox" element={<Xbox />} />
        <Route path="/nintendo" element={<Nintendo />} />
        <Route path="/tech" element={<Tech />} />

        {/* Admin login + dashboard */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Protected admin pages */}
        <Route
          path="/admin/newreview"
          element={
            <ProtectedRoute>
              <AdminNewReview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/edit/:id"
          element={
            <ProtectedRoute>
              <AdminNewReview />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
