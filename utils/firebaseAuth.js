const { admin } = require("./admin");

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  let idToken;
  const authorization = req.headers.authorization;
  if (authorization && authorization.startsWith("Bearer ")) {
    idToken = authorization.split("Bearer ")[1];
  } else {
    console.log("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      return next();
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
