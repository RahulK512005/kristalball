const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await query.get('users', { username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    let baseInfo = null;
    if (user.base_id) {
      baseInfo = await query.get('bases', { id: user.base_id });
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      baseId: user.base_id,
      fullName: user.full_name
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'kristallball_military_super_secret_jwt_key_2026!',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.full_name,
        baseId: user.base_id,
        base: baseInfo
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await query.get('users', { id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let baseInfo = null;
    if (user.base_id) {
      baseInfo = await query.get('bases', { id: user.base_id });
    }

    return res.status(200).json({
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.full_name,
      baseId: user.base_id,
      base: baseInfo
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};
