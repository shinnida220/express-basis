const JWT = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers?.token;
  if (!authHeader) {
    return res.status(401).json({
      status: false,
      message: 'You are not authenticated'
    });
  }
  JWT.verify(authHeader, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: false, message: 'Token is not valid'
      });
    }

    req.user = user;
    next();
  });
}

const isAuthorized = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin || req.user.id === req.params?.id) {
      next();
    } else {
      return res.status(403).json({
        status: false,
        message: 'You are not allowed to perform this operation'
      });
    }
  })
}

const isAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({
        status: false,
        message: 'You are not allowed to perform this operation'
      });
    }
  })
}

module.exports = { verifyToken, isAdmin, isAuthorized };