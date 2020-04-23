const { db } = require("../utils/admin");
const config = require("../utils/config");
const firebase = require("firebase");

firebase.initializeApp(config);

const auth = firebase.auth();

exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    username: req.body.username,
  };
  let userId, token;
  db.doc(`users/${newUser.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ username: "Username already in use!" });
      } else {
        return auth.createUserWithEmailAndPassword(
          newUser.email,
          newUser.password
        );
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        username: newUser.username,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db.doc(`users/${newUser.username}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use!" });
      } else {
        console.log(err.code);
        return res
          .status(500)
          .json({ global: "Something went wrong. Please try again." });
      }
    });
};

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };
  auth
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.status(200).json({ token });
    })
    .catch((err) => {
      console.error(err);
      return res.status(403).json({ global: "Wrong credentials!" });
    });
};
