import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://collab:collabsphere@cluster0.5vawtoi.mongodb.net/collabSphere";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const subtasks = await db.collection("subtasks").find({}).toArray();
  console.log("Subtasks:", JSON.stringify(subtasks, null, 2));

  mongoose.disconnect();
}

main().catch(console.error);
