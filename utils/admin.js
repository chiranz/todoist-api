const admin = require("firebase-admin");
const config = require("./config");
const credentials = require("./credential");

admin.initializeApp({
  credential: admin.credential.cert(credentials),
  databaseURL: config.databaseURL,
});

const db = admin.firestore();

module.exports = { admin, db };
