import followservice from "../services/followservice";
import { Request,Response } from "express";

export default new class FollowController{
    follow(req:Request,res:Response){
        followservice.follow(req,res)
    }
}