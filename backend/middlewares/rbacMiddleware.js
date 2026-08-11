const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access Denied: Role '${req.user ? req.user.role : 'GUEST'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

const enforceBaseScope = (req, res, next) => {
  // If user is a Base Commander, automatically restrict query/body context to their assigned baseId
  if (req.user && req.user.role === 'BASE_COMMANDER') {
    if (req.user.baseId) {
      req.query.baseId = String(req.user.baseId);
      if (req.body && req.body.baseId) {
        req.body.baseId = Number(req.user.baseId);
      }
    }
  }
  next();
};

module.exports = { authorizeRoles, enforceBaseScope };
