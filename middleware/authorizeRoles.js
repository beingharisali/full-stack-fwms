const roleHierarchy = {
  admin: ["admin", "manager", "driver"],
  manager: ["driver"],
  driver: [],
};

const authorizeRoles = (...targetRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!roleHierarchy[userRole]) {
      return res.status(403).json({
        success: false,
        message: "Invalid role",
      });
    }

    const canAccess = targetRoles.some(role =>
      role === userRole || roleHierarchy[userRole].includes(role)
    );

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied for your role",
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
