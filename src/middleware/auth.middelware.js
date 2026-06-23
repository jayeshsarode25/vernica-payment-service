import jwt from 'jsonwebtoken'
import config from '../config/config.js'

export function authMiddleware(req, res, next) {

  const cookieToken = req.cookies?.token;
  const token = cookieToken || req.headers?.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId ?? decoded.id ?? decoded._id;

    req.auth = {
      hasTokenCookie: Boolean(cookieToken),
      userId,
      role: decoded.role,
      authenticated: Boolean(decoded),
    };
    req.user = { ...decoded, userId: req.auth.userId, id: req.auth.userId, role: req.auth.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}

export default authMiddleware;
