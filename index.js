import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; 
import userRoutes from './routes/user.route.js';
import { createClient } from  "redis";


dotenv.config();
await connectDB();
const redishurl = process.env.REDIS_URL;
if (!redishurl) {
    console.error("REDIS_URL is not defined in the environment variables");
    process.exit(1);
}

export const redisClient = createClient({
    url: redishurl,
});

redisClient.connect().then(()=>console.log("Connected to Redis successfully")).catch((err)=>{
    console.error("Error connecting to Redis:", err);
    process.exit(1);
});
const app = express();
app.use(express.json());    

app.use("/api", userRoutes);




const PORT = process.env.PORT || 3000;
 app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});