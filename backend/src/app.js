//We have all the express.js code in the app.js file. All the configurations of the API will be written here. 
import express, { urlencoded } from "express"
import cors from "cors";
import cookieParser from "cookie-parser";  

const app=express()

//basic configuration of express  app.use->middleware
app.use(express.json({limit:"16kb"}))//allowing json as input
app.use(express.urlencoded({extended:true,limit:"16kb"}))//url optimization
app.use(express.static("public"))//allowing users to view some images from the public folder
app.use(cookieParser())

//cors configuration
app.use(cors({
    origin:process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials:true,
    methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders:["Content-Type","Authorization"],
})) //where our frontend lies, may take 4-5sec


//IMPORT THE ROUTES
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js"
import noteRouter from "./routes/note.routes.js";



app.use("/api/v1/healthcheck",healthCheckRouter) //this is our home page now
app.get("/",(req,res)=>{
    res.send("Welcome to CollabShpere");
});

//registerUser
app.use("/api/v1/auth",authRouter);
//ProjectSection
app.use("/api/v1/projects",projectRouter);
//task section
app.use("/api/v1/tasks",taskRouter);
//notes section
app.use("/api/v1/notes",noteRouter);



export default app;
