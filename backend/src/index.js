// this file is the just the entrypoint Where we define the port and it just listens 
import "dotenv/config"
import app from "./app.js"
import connectDB from "./db/index.js";


const port = process.env.PORT || 3000;


connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`example app listening on port http://localhost:${port}`)
        })
    })
    .catch((err) => {
        console.log("mongodb connection error", err);
        process.exit(1)
    })