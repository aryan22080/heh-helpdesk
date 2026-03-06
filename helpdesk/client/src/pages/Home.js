import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="grid-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="hero-tag">⚕ Hostile Environment Healthcare</div>
          <h1 className="hero-title">
            Help Desk
            <span className="hero-title-accent"> Support Center</span>
          </h1>
          <p className="hero-subtitle">
            Rapid-response support for healthcare professionals operating in
            the most demanding conditions on earth. Submit issues or share feedback.
          </p>
          <div className="hero-actions">
            <Link to="/issues" className="btn btn-primary btn-lg">
              🚨 Submit an Issue
            </Link>
            <Link to="/feedback" className="btn btn-outline btn-lg">
              💬 Share Feedback
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="features">
        <div className="features-inner">
          <Link to="/issues" className="feature-card feature-issues">
            <div className="feature-icon">🚨</div>
            <h2>Report an Issue</h2>
            <p>
              Experiencing a technical, medical supply, equipment, or operational
              problem? Submit it here and receive an instant email confirmation
              with a unique ticket ID.
            </p>
            <ul className="feature-list">
              <li>✔ Instant email confirmation</li>
              <li>✔ Priority-based response times</li>
              <li>✔ Unique ticket tracking ID</li>
              <li>✔ Support team notified immediately</li>
            </ul>
            <span className="feature-cta">Submit Issue →</span>
          </Link>

          <Link to="/feedback" className="feature-card feature-feedback">
            <div className="feature-icon">💬</div>
            <h2>Provide Feedback</h2>
            <p>
              Your experience matters. Help us improve our services in hostile
              environments by sharing what worked, what didn't, and what we
              can do better.
            </p>
            <ul className="feature-list">
              <li>✔ Rate your experience (1–5 stars)</li>
              <li>✔ Service-specific feedback</li>
              <li>✔ Would-recommend indicator</li>
              <li>✔ Email acknowledgment sent</li>
            </ul>
            <span className="feature-cta">Give Feedback →</span>
          </Link>
        </div>
      </section>

      {/* Info banner */}
      <section className="info-banner">
        <div className="info-banner-inner">
          <div className="info-item">
            <span className="info-num">24/7</span>
            <span className="info-label">Support Monitoring</span>
          </div>
          <div className="info-divider"></div>
          <div className="info-item">
            <span className="info-num">&lt;1hr</span>
            <span className="info-label">Critical Response</span>
          </div>
          <div className="info-divider"></div>
          <div className="info-item">
            <span className="info-num">100%</span>
            <span className="info-label">Ticket Confirmation</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
