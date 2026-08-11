const { query } = require('../config/db');

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await query.all('audit_logs');
    const users = await query.all('users');
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    const enriched = logs.map(log => ({
      ...log,
      username: userMap[log.user_id]?.username || 'System',
      userFullName: userMap[log.user_id]?.full_name || 'System User',
      userRole: userMap[log.user_id]?.role || 'SYSTEM'
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json(enriched);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
};
