const admin = require("firebase-admin");
const serviceAccount = require("../config/worldexplorer-f0f55-firebase-adminsdk-fbsvc-20a07da92e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
