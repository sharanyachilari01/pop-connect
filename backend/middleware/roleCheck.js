const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Admin has unrestricted access to all data and actions.
    if (req.user && (req.user.role === 'Admin' || roles.includes(req.user.role))) {
        next();
    } else {
        res.status(403).json({ message: `Role (${req.user?.role}) is not authorized to access this resource` });
    }
  };
};

module.exports = { authorizeRoles };
