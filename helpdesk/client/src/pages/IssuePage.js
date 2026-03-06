import React, { useState } from 'react';
import axios from 'axios';
import './FormPage.css';

const INITIAL_FORM = {
  name: '',
  email: '',
  category: 'other',
  priority: 'medium',
  subject: '',
  description: ''
};

const IssuePage = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'description') setCharCount(value.length);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const { data } = await axios.post('/api/issues', form);
      if (data.success) {
        setSuccess(data.data);
        setForm(INITIAL_FORM);
        setCharCount(0);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit issue. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(null);
    setError('');
    setForm(INITIAL_FORM);
    setCharCount(0);
  };

  const priorityConfig = {
    low: { label: 'Low', desc: 'Non-urgent, informational', color: '#22c55e' },
    medium: { label: 'Medium', desc: 'Needs attention within 24h', color: '#f59e0b' },
    high: { label: 'High', desc: 'Urgent, within 8 hours', color: '#ef4444' },
    critical: { label: 'Critical', desc: 'Immediate — life/ops risk', color: '#a855f7' }
  };

  if (success) {
    return (
      <div className="page-container">
        <div className="card success-state">
          <span className="success-icon">✅</span>
          <h2>Issue Submitted</h2>
          <p>Your issue has been received and logged in our system.</p>
          <p>A confirmation email has been sent to your inbox.</p>
          <div className="ticket-display">{success.ticketId}</div>
          <p className="ticket-note">Save this ticket ID for reference</p>

          <div className="success-details">
            <div className="success-detail-row">
              <span>Status</span>
              <span className="badge badge-open">Open</span>
            </div>
            <div className="success-detail-row">
              <span>Email Confirmation</span>
              <span>{success.emailSent ? '✅ Sent' : '⚠ Check email config'}</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleReset} style={{ marginTop: 24 }}>
            Submit Another Issue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="tag">Support</span>
        <h1>Report an <span>Issue</span></h1>
        <p>Fill in the form below. You'll receive an email confirmation with your ticket ID instantly.</p>
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

          {/* Category & Priority */}
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="form-control">
                <option value="technical">🔧 Technical</option>
                <option value="medical">🏥 Medical Supply</option>
                <option value="equipment">⚙️ Equipment</option>
                <option value="logistics">📦 Logistics</option>
                <option value="safety">🛡️ Safety</option>
                <option value="other">📋 Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="form-control">
                {Object.entries(priorityConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label} — {cfg.desc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority indicator */}
          <div className="priority-indicator" style={{ '--p-color': priorityConfig[form.priority].color }}>
            <span className="priority-dot"></span>
            <span>
              <strong>{priorityConfig[form.priority].label} Priority</strong>
              {' — '}
              {form.priority === 'critical' ? 'Response within 1–2 hours' :
               form.priority === 'high' ? 'Response within 4–8 hours' :
               form.priority === 'medium' ? 'Response within 24 hours' :
               'Response within 48–72 hours'}
            </span>
          </div>

          {/* Subject */}
          <div className="form-group">
            <label>Subject <span className="required">*</span></label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="form-control"
              placeholder="Brief description of the issue"
              required
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>
              Issue Description <span className="required">*</span>
              <span className="char-count">{charCount}/2000</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="form-control"
              placeholder="Please describe the issue in detail — include any relevant context, location, or urgency factors..."
              required
              maxLength={2000}
              rows={6}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? (
              <><span className="spinner"></span> Submitting...</>
            ) : (
              '🚨 Submit Issue'
            )}
          </button>

          <p className="form-footer-note">
            By submitting, you'll receive a confirmation email at the address provided.
          </p>
        </form>
      </div>
    </div>
  );
};

export default IssuePage;
