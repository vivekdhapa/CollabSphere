import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://collab:collabsphere@cluster0.5vawtoi.mongodb.net/collabSphere";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;

  // Let's get the first task
  const task = await db.collection("tasks").findOne({});
  console.log("Found task ID:", task._id.toString());

  // Let's run the exact pipeline from the controller
  const result = await db.collection("tasks").aggregate([
        {
            $match:{
                _id: task._id
            }
        },
        {
            $lookup:{
                from:"subtasks",
                localField:"_id",
                foreignField:"task",
                as:"subtasks",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"createdBy",
                            foreignField:"_id",
                            as:"createdBy",
                            pipeline:[
                                {
                                    $project:{
                                        _id:1,
                                        username:1,
                                        fullName:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            createdBy:{
                                $arrayElemAt:["$createdBy",0]
                            }
                        }
                    }
                ]
            }
        }
    ]).toArray();
  
  console.log("Subtasks length:", result[0].subtasks.length);
  console.log("Subtasks:", JSON.stringify(result[0].subtasks, null, 2));

  mongoose.disconnect();
}

main().catch(console.error);
