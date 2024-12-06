import express from "express";
import { signup } from "../constroller/auth.controller";

const router = express.router();


router.post("/signup", signup);



export default router;