const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send confirmation email to user who submitted the issue
const sendIssueConfirmationEmail = async (issue) => {
  const transporter = createTransporter();

  const priorityColors = {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#f44336',
    critical: '#9C27B0'
  };

  const mailOptions = {
    from: `"HEH Healthcare Help Desk" <${process.env.EMAIL_USER}>`,
    to: issue.email,
    subject: `[${issue.ticketId}] Issue Received - ${issue.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f0f4f8; }
          .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 40px 32px; text-align: center; }
          .header h1 { color: #e94560; margin: 0 0 8px; font-size: 24px; letter-spacing: 2px; }
          .header p { color: #a0aec0; margin: 0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; }
          .body { padding: 32px; }
          .ticket-badge { background: #1a1a2e; border: 1px solid #e94560; border-radius: 8px; padding: 12px 20px; display: inline-block; margin-bottom: 24px; }
          .ticket-badge span { color: #e94560; font-weight: 700; font-size: 18px; letter-spacing: 2px; }
          .greeting { color: #2d3748; font-size: 18px; margin-bottom: 16px; }
          .message { color: #4a5568; line-height: 1.7; margin-bottom: 24px; }
          .details-box { background: #f7fafc; border-left: 4px solid #e94560; border-radius: 0 8px 8px 0; padding: 20px 24px; margin: 24px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #718096; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          .detail-value { color: #2d3748; font-size: 14px; font-weight: 500; }
          .priority-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; color: white; background: ${priorityColors[issue.priority] || '#718096'}; }
          .footer { background: #f7fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center; }
          .footer p { color: #a0aec0; font-size: 12px; margin: 4px 0; }
          .response-time { background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 8px; padding: 12px 16px; margin-top: 16px; color: #2b6cb0; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚕ HEH HEALTHCARE</h1>
            <p>Hostile Environment Healthcare — Help Desk</p>
          </div>
          <div class="body">
            <div class="ticket-badge">
              <span>🎫 ${issue.ticketId}</span>
            </div>
            <p class="greeting">Dear ${issue.name},</p>
            <p class="message">
              Your issue has been successfully submitted to our support team. We understand the critical nature of healthcare operations in hostile environments and will address your concern promptly.
            </p>
            <div class="details-box">
              <div class="detail-row">
                <span class="detail-label">Subject</span>
                <span class="detail-value">${issue.subject}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Category</span>
                <span class="detail-value">${issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Priority</span>
                <span class="detail-value"><span class="priority-badge">${issue.priority.toUpperCase()}</span></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Submitted</span>
                <span class="detail-value">${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>
            <div class="response-time">
              ⏱ <strong>Expected Response Time:</strong> 
              ${issue.priority === 'critical' ? '1-2 hours' : issue.priority === 'high' ? '4-8 hours' : issue.priority === 'medium' ? '24 hours' : '48-72 hours'}
            </div>
            <p class="message" style="margin-top: 20px;">
              Please save your ticket ID <strong>${issue.ticketId}</strong> for future reference. Our team will respond to <strong>${issue.email}</strong>.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Hostile Environment Healthcare Service Provider</p>
            <p>This is an automated confirmation. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};

// Send notification to support team
const sendSupportNotificationEmail = async (issue) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"HEH Help Desk System" <${process.env.EMAIL_USER}>`,
    to: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
    subject: `[NEW ISSUE - ${issue.priority.toUpperCase()}] ${issue.ticketId}: ${issue.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
          .header { background: #1a1a2e; color: #e94560; padding: 20px; font-size: 20px; font-weight: bold; }
          .body { padding: 24px; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 10px 14px; border-bottom: 1px solid #eee; }
          td:first-child { background: #f7fafc; font-weight: bold; color: #555; width: 35%; }
          .description { background: #f7fafc; padding: 16px; border-radius: 6px; margin-top: 16px; white-space: pre-wrap; color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">🚨 New Support Issue — Action Required</div>
          <div class="body">
            <table>
              <tr><td>Ticket ID</td><td><strong>${issue.ticketId}</strong></td></tr>
              <tr><td>Submitted By</td><td>${issue.name}</td></tr>
              <tr><td>Email</td><td>${issue.email}</td></tr>
              <tr><td>Category</td><td>${issue.category}</td></tr>
              <tr><td>Priority</td><td><strong>${issue.priority.toUpperCase()}</strong></td></tr>
              <tr><td>Subject</td><td>${issue.subject}</td></tr>
              <tr><td>Submitted At</td><td>${new Date().toLocaleString()}</td></tr>
            </table>
            <p><strong>Issue Description:</strong></p>
            <div class="description">${issue.description}</div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};

// Send feedback acknowledgment
const sendFeedbackAcknowledgmentEmail = async (feedback) => {
  const transporter = createTransporter();

  const stars = '⭐'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);

  const mailOptions = {
    from: `"HEH Healthcare Help Desk" <${process.env.EMAIL_USER}>`,
    to: feedback.email,
    subject: `Thank you for your feedback — ${feedback.feedbackId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f0f4f8; }
          .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 40px 32px; text-align: center; }
          .header h1 { color: #e94560; margin: 0 0 8px; font-size: 24px; letter-spacing: 2px; }
          .header p { color: #a0aec0; margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
          .body { padding: 32px; }
          .stars { font-size: 28px; margin: 16px 0; }
          .message { color: #4a5568; line-height: 1.7; }
          .footer { background: #f7fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center; }
          .footer p { color: #a0aec0; font-size: 12px; margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚕ HEH HEALTHCARE</h1>
            <p>Thank You for Your Feedback</p>
          </div>
          <div class="body">
            <p class="message">Dear <strong>${feedback.name}</strong>,</p>
            <div class="stars">${stars}</div>
            <p class="message">
              Thank you for taking the time to share your experience with our healthcare services. Your feedback (ID: <strong>${feedback.feedbackId}</strong>) helps us continuously improve our operations in hostile environments.
            </p>
            <p class="message">
              We truly value your input and are committed to delivering the highest standard of care, no matter the conditions.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Hostile Environment Healthcare Service Provider</p>
            <p>This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendIssueConfirmationEmail,
  sendSupportNotificationEmail,
  sendFeedbackAcknowledgmentEmail
};
