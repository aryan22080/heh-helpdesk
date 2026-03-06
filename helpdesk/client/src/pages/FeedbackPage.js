import React, { useState } from 'react';
import axios from 'axios';
import './FormPage.css';

const INITIAL_FORM = {
  name: '',
  email: '',
  serviceType: 'other',
  rating: 0,
  experience: '',
  improvements: '',
  wouldRecommend: true
};

const FeedbackPage = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const handleRating = (rating) => {
    setForm(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) {
      setError('Please select a star rating before submitting.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const { data } = await axios.post('/api/feedback', form);
      if (data.success) {
        setSuccess(data.data);
        setForm(INITIAL_FORM);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit feedback. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(null);
    setError('');
    setForm(INITIAL_FORM);
  };

  const ratingLabels = ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'];
  const displayRating = hoverRating || form.rating;

  if (success) {
    return (
      <div className="page-container">
        <div className="card success-state">
          <span className="success-icon">🙏</span>
          <h2 style={{ color: '#3b82f6' }}>Thank You!</h2>
          <p>Your feedback has been recorded successfully.</p>
          <p>An acknowledgment has been sent to your email.</p>
          <div className="ticket-display" style={{ color: '#3b82f6', borderColor: 'rgba(59,130,246,0.3)' }}>
            {success.feedbackId}
          </div>
          <p className="ticket-note">Feedback reference ID</p>
          <div className="success-details">
            <div className="success-detail-row">
              <span>Email Sent</span>
              <span>{success.emailSent ? '✅ Sent' : '⚠ Check email config'}</span>
            </div>
          </div>
          <button className="btn btn-outline" onClick={handleReset} style={{ marginTop: 24 }}>
            Submit More Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="tag" style={{ color: '#3b82f6', borderColor: 'rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.1)' }}>
          Feedback
        </span>
        <h1>Share Your <span style={{ color: '#3b82f6' }}>Experience</span></h1>
        <p>Help us improve healthcare in hostile environments by sharing your honest feedback.</p>
      </div>

      <div className="card form-card">
        {error && (
          <div className="alert alert-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name & Email */}
          <div className="form-row">
            <div className="form-group">
              <label>Your Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Full name"
                required
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label>Email Address <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="form-control"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Service Type */}
          <div className="form-group">
            <label>Service Type</label>
            <select name="serviceType" value={form.serviceType} onChange={handleChange} className="form-control">
              <option value="field-medical">🏕️ Field Medical Support</option>
              <option value="emergency-response">🚑 Emergency Response</option>
              <option value="equipment">⚙️ Equipment & Supplies</option>
              <option value="training">📚 Training & Briefing</option>
              <option value="coordination">📡 Operational Coordination</option>
              <option value="other">📋 Other</option>
            </select>
          </div>

          {/* Star Rating */}
          <div className="form-group">
            <label>Overall Rating <span className="required">*</span></label>
            <div className="star-rating-container">
              <div className="stars-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= displayRating ? 'filled' : ''}`}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Rate ${star} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {displayRating > 0 && (
                <span className="rating-label">{ratingLabels[displayRating]}</span>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="form-group">
            <label>Your Experience <span className="required">*</span></label>
            <textarea
              name="experience"
              value={form.experience}
              onChange={handleChange}
              className="form-control"
              placeholder="Describe your experience with our healthcare services in the field..."
              required
              maxLength={2000}
              rows={5}
            />
          </div>

          {/* Improvements */}
          <div className="form-group">
            <label>Suggested Improvements</label>
            <textarea
              name="improvements"
              value={form.improvements}
              onChange={handleChange}
              className="form-control"
              placeholder="What could we do better? Any specific recommendations?"
              maxLength={1000}
              rows={3}
            />
          </div>

          {/* Would Recommend */}
          <div className="form-group">
            <label>Would You Recommend Our Services?</label>
            <div className="recommend-toggle">
              <label className={`toggle-option ${form.wouldRecommend ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="wouldRecommend"
                  value={true}
                  checked={form.wouldRecommend === true}
                  onChange={() => setForm(prev => ({ ...prev, wouldRecommend: true }))}
                />
                👍 Yes, I would recommend
              </label>
              <label className={`toggle-option ${!form.wouldRecommend ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="wouldRecommend"
                  value={false}
                  checked={form.wouldRecommend === false}
                  onChange={() => setForm(prev => ({ ...prev, wouldRecommend: false }))}
                />
                👎 No, not at this time
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full feedback-submit" disabled={loading}>
            {loading ? (
              <><span className="spinner"></span> Submitting...</>
            ) : (
              '💬 Submit Feedback'
            )}
          </button>

          <p className="form-footer-note">
            Your feedback is reviewed by our operations team to continuously improve field services.
          </p>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;
