/**
 * Returns a middleware function that checks if the user has the required role
 * @param {[]} requiredRoles - A list of roles to allow
 * @returns 
 */
function role(requiredRoles) {
  return (req, res, next) => {
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You don\'t have the required role' });
    }
    next();
  };
}

export default role;