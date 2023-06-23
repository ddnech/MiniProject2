const jwt = require('jsonwebtoken');

const checkAuth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).send({
      message: "token is not found",
    });
    return;
  }

  const [format, token] = authorization.split(" ");
  if (format.toLocaleLowerCase() === "bearer") {
    try {
      const payload = jwt.verify(token, process.env.secret_key);
      if (!payload) {
        res.status(401).send({
          message: "Token verification failed",
        });
        return;
      }
      req.user = payload;
      next();
    } catch (error) {
      res.status(401).send({
        message: "Invalid token",
        error,
      });
    }
  }
};

module.exports = checkAuth;
