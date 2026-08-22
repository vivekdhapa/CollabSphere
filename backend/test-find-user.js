import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://collab:collabsphere@cluster0.5vawtoi.mongodb.net/collabSphere";

async function main() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const users = await db.collection("users").find({}).limit(1).toArray();
  console.log("User email:", users[0].email);
  mongoose.disconnect();
}
main().catch(console.error);
