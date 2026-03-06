const express = require('express');
const router = express.Router();
const { Issue, Feedback } = require('./models');
const { sendIssueConfirmationEmail, sendSupportNotificationEmail, sendFeedbackAcknowledgmentEmail } = require('./emailService');

// ─── ISSUE ROUTES ─────────────────────────────────────────────

// POST /api/issues — Submit a new issue
router.post('/issues', async (req, res) => {
  try {
    const { name, email, category, priority, subject, description } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, subject, and description.'
      });
    }

    // Create and save the issue
    const issue = new Issue({ name, email, category, priority, subject, description });
    await issue.save();

    // Send emails
    let emailStatus = { userEmail: false, supportEmail: false };
    try {
      await sendIssueConfirmationEmail(issue);
      emailStatus.userEmail = true;
    } catch (emailErr) {
      console.error('User confirmation email failed:', emailErr.message);
    }

    try {
      await sendSupportNotificationEmail(issue);
      emailStatus.supportEmail = true;
    } catch (emailErr) {
      console.error('Support notification email failed:', emailErr.message);
    }

    // Update email sent status
    if (emailStatus.userEmail) {
      issue.emailSent = true;
      await issue.save();
    }

    res.status(201).json({
      success: true,
      message: 'Your issue has been submitted successfully.',
      data: {
        ticketId: issue.ticketId,
        status: issue.status,
        emailSent: emailStatus.userEmail,
        createdAt: issue.createdAt
      }
    });

  } catch (error) {
    console.error('Error submitting issue:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// GET /api/issues — Get all issues (for admin/dashboard)
router.get('/issues', async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Issue.countDocuments(filter);

    res.json({
      success: true,
      data: issues,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/issues/stats — Get issue statistics
router.get('/issues/stats', async (req, res) => {
  try {
    const total = await Issue.countDocuments();
    const open = await Issue.countDocuments({ status: 'open' });
    const inProgress = await Issue.countDocuments({ status: 'in-progress' });
    const resolved = await Issue.countDocuments({ status: 'resolved' });
    const critical = await Issue.countDocuments({ priority: 'critical' });

    res.json({ success: true, data: { total, open, inProgress, resolved, critical } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── FEEDBACK ROUTES ──────────────────────────────────────────

// POST /api/feedback — Submit feedback
router.post('/feedback', async (req, res) => {
  try {
    const { name, email, serviceType, rating, experience, improvements, wouldRecommend } = req.body;

    if (!name || !email || !rating || !experience) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, rating, and experience.'
      });
    }

    const feedback = new Feedback({ name, email, serviceType, rating, experience, improvements, wouldRecommend });
    await feedback.save();

    // Send acknowledgment email
    let emailSent = false;
    try {
      await sendFeedbackAcknowledgmentEmail(feedback);
      emailSent = true;
    } catch (emailErr) {
      console.error('Feedback acknowledgment email failed:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: {
        feedbackId: feedback.feedbackId,
        emailSent,
        createdAt: feedback.createdAt
      }
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// GET /api/feedback — Get all feedback
router.get('/feedback', async (req, res) => {
  try {
    const { page = 1, limit = 10, serviceType } = req.query;
    const filter = {};
    if (serviceType) filter.serviceType = serviceType;

    const feedbacks = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments(filter);

    res.json({
      success: true,
      data: feedbacks,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/feedback/stats — Feedback statistics
router.get('/feedback/stats', async (req, res) => {
  try {
    const total = await Feedback.countDocuments();
    const avgRatingResult = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating.toFixed(1) : 0;
    const recommended = await Feedback.countDocuments({ wouldRecommend: true });

    res.json({ success: true, data: { total, avgRating, recommended } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
