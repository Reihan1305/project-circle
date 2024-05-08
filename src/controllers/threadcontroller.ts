import { Request,Response } from "express";
import threadservice from "../services/threadservice";
import Threadqueue from "../queue/addthreadqueue"

export default new class ThreadController{
    findAll(req:Request,res:Response){
        threadservice.findAll(req,res)
    }
    findAllRedis(req:Request,res:Response){
        threadservice.findAllRedis(req,res)
    }
    findById(req:Request,res:Response){
        threadservice.findById(req,res)
    }
    addThread(req:Request,res:Response){
        threadservice.addThread(req,res)
    }
    updateThread(req:Request,res:Response){
        threadservice.updateThread(req,res)
    }
    deleteThread(req:Request,res:Response){
        threadservice.deleteThread(req,res)
    }
    addThreadqueue(req:Request,res:Response){
        Threadqueue.addThreadqueue(req,res)
    }
}