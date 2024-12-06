import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js"

const app = express();

const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "https://localhost:3000", credentials: true}));

app.use("/api/auth", authRoutes);

app.listen(port, ()=>{
    console.log(`Conneted to ${port}`);
});