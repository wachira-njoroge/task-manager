import express, {Request, Response, NextFunction} from "express";
import cors from 'cors'
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import taskRoutes from "./routes/taskRoutes";

//Avail environment variables
dotenv.config()

const app = express()
const port = process.env.PORT || 5400

app.use(cors())
app.use(express.json())

//Default route
app.get("/", (req, res) => {
  res.send('OK').json({ message: "Welcome to Tasks Management System API" });
});


app.use("/api/users", userRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/tasks", taskRoutes)

//Inform user of any errors if they occur
app.use((err:Error, req:Request, res:Response, next: NextFunction)=>{
    res.status(500).send(err.message)
})

app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`);    
})