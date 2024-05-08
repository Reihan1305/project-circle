import {Response,Request} from "express";
import authservice from "../services/authservice";

export default new class Autcontroller {
    async register(req:Request,res:Response){
        authservice.register(req,res)
    }
    async login(req:Request,res:Response){
        authservice.login(req,res)
    }
    async check(req:Request,res:Response){
        authservice.check(req,res)
    }
    async logout(req:Request,res:Response){
        authservice.logout(req,res)
    }
}