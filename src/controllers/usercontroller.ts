import userservice from "../services/userservice";
import { Response,Request } from "express";

export default new class UserController {
    findAll(req:Request, res:Response){
        userservice.findAll(req,res)
    }
    findById(req:Request, res:Response){
        userservice.findById(req,res)
    }
    findByName(req:Request, res:Response){
        userservice.findByName(req,res)
    }
    updateWhitoutImage(req:Request, res:Response){
        userservice.updateWithoutImage(req, res)
    }
    uploadProfilePicture(req:Request, res:Response){
        userservice.uploadProfilePicture(req,res)
    }
    getSugesteduUser(req:Request, res:Response){
        userservice.getSugestedUser(req,res)
    }
    deleteUser(req:Request, res:Response){
        userservice.deleteUser(req,res)
    }
}
