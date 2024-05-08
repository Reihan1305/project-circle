import likeservice from "../services/likeservice";
import { Request,Response } from "express";

export default new class LikeController{
    like(req:Request,res:Response){
        likeservice.like(req,res)
    }
}