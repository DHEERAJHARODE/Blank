import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Find rooms you’ll <span>love</span> to stay in
          </h1>
          <p>
            Trusted room rentals for students, professionals & families.
            Verified owners. Safe stays.
          </p>

          <div className="hero-buttons">
            <button onClick={() => navigate("/rooms")}>
              🔍 Find a Room
            </button>
            <button
              className="secondary"
              onClick={() => navigate("/register")}
            >
              🏠 List Your Room
            </button>
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="trust">
        <div className="trust-card">✅ Verified Owners</div>
        <div className="trust-card">🔒 Secure Payments</div>
        <div className="trust-card">📍 Real Locations</div>
        <div className="trust-card">⭐ Trusted by Renters</div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how">
        <h2>How it works</h2>

        <div className="steps">
          <div className="step">
            <span>1</span>
            <h4>Search Room</h4>
            <p>Browse rooms that fit your needs & budget</p>
          </div>

          <div className="step">
            <span>2</span>
            <h4>Book & Connect</h4>
            <p>Send booking request & talk to owner</p>
          </div>

          <div className="step">
            <span>3</span>
            <h4>Move In</h4>
            <p>Safe stay with verified listings</p>
          </div>
        </div>
      </section>

      {/* OWNER CTA */}
      <section className="owner-cta">
        <h2>Have a room to rent?</h2>
        <p>List your room and start earning today</p>
        <button onClick={() => navigate("/register")}>
          Become an Owner
        </button>
      </section>
    </div>
  );
};

export default Home;
