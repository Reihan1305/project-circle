import { Response,Request } from "express";
import replyservice from "../services/replyservice";

export default new class ReplyController {
    addReply(req:Request,res:Response){
        replyservice.addReply(req,res)
    }
    updateReply(req:Request,res:Response){
        replyservice.updateReply(req,res)
    }
    deleteReply(req:Request,res:Response){
        replyservice.deleteReply(req,res)
    }
}