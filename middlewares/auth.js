const jwt = require("jsonwebtoken");
function roleAuthMiddleware(roles) {
  return (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      res.status(401).send({ message: "token not provided" });
      return;
    }
    try {
      let data = jwt.verify(token, "getToken");
      if (roles.includes(data.role)) {
        req.userId = data.id;
        req.userRole = data.role;
        next();
      } else {
        return res.status(402).send({ message: "not allowed" });
      }
    } catch (error) {
      console.log(error);
    }
  };
}

module.exports = roleAuthMiddleware;
