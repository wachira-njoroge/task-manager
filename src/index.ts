/**
 * This file maps out all the endpoints used in the application to post or retrieve data
 * Every route leads to the controller that handles the request
 */ 
import express, {Request, Response, NextFunction} from "express";
import cors from 'cors'
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import taskRoutes from "./routes/taskRoutes";

// Avail environment variables from the env file
dotenv.config()

const app = express()
const port = process.env.PORT || 5400

app.use(cors())
app.use(express.json())

//Set the default route
app.get("/", (req, res) => {
  res.send('OK').json({ message: "Welcome to Tasks Management System API" });
});
// Set all the other application routes
app.use("/api/users", userRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/tasks", taskRoutes)

//Inform user of any errors if they occur
app.use((err:Error, req:Request, res:Response, next: NextFunction)=>{
    res.status(500).send(err.message)
})
// Expose the port that will be utilised by the application when it launches
app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`);    
})