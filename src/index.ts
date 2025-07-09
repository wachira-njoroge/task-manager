import express, {Request, Response, NextFunction} from "express";
import cors from 'cors'
import dotenv from "dotenv";

//Avail environment variables
dotenv.config()

const app = express()
const port = process.env.PORT || 5400

app.use(cors())
app.use(express.json())

//Inform user of any errors if they occur
app.use((err:Error, req:Request, res:Response, next: NextFunction)=>{
    res.status(500).send(err.message)
})

app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`);    
})