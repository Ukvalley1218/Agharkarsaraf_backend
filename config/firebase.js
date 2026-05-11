import admin from "firebase-admin";
import fs from "fs/promises";
import path from "path";

const serviceAccountPath = path.join(
  process.cwd(),
  "config/firebaseServiceAccount.json"
);

const serviceAccount = JSON.parse(
  await fs.readFile(serviceAccountPath, "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
