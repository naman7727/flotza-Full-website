const { verifyToken } = require('./jwt');
const { errorResponse } = require('./response');

const authMiddleware = (allowedRoles) => {
  //console.log("coming in mkd");
  
  return (req, res, next) => {
    //  console.log("Headers:", req.headers); // Log all headers
    const authHeader = req.headers.authorization;
    // console.log("Auth Header:", authHeader); // Log the auth header specifically
    if (!authHeader) {
      return res.status(401).json(errorResponse('No token provided'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json(errorResponse('Invalid token format'));
    }

    try {
      const decoded = verifyToken(token);
      // console.log("Decoded Token:", decoded);
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json(errorResponse(`Unauthorized access: Role '${decoded.role}' not allowed`));
      }
      
      if (decoded.role === 'customer' && !decoded.customer_id) {
        decoded.customer_id = decoded.id;
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json(errorResponse('Invalid or expired token'));
    }
  };
};

module.exports = { authMiddleware };