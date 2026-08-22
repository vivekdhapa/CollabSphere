import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://collab:collabsphere@cluster0.5vawtoi.mongodb.net/collabSphere";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  
  const tasks = await db.collection("tasks").aggregate([
        {
            $lookup:{
                from:"subtasks",
                localField:"_id",
                foreignField:"task",
                as:"subtasks"
            }
        }
  ]).toArray();
  
  console.log("Task 0 subtasks count:", tasks[0].subtasks.length);
  console.log("Task 0 subtasks:", JSON.stringify(tasks[0].subtasks, null, 2));

  mongoose.disconnect();
}

main().catch(console.error);
