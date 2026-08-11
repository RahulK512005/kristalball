const { query } = require('../config/db');

const logAuditTrail = async (userId, action, details) => {
  try {
    await query.insert('audit_logs', {
      user_id: userId || null,
      action: action,
      details: details,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to log audit trail:', err.message);
  }
};

module.exports = { logAuditTrail };
