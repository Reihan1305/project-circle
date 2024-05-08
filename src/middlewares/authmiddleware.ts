import * as jwt from "jsonwebtoken";
import { Request,Response,NextFunction } from "express";

export default new class Auhtmiddleware{
    Authi(req:Request, res:Response, next :NextFunction){
        try{
            const authorz = req.header('Authorization')

            if(!authorz || !authorz.startsWith("Bearer ")){
                return res.status(401).json({Error : "UNAUTHORIZATION"})
            }

            const token = authorz.split(' ')[1]

            try{
                const loginsession = jwt.verify(token, "secretKey")
                res.locals.loginSession =loginsession
                next()
            }catch(error){
                res.status(401).json(error)
            }
        }catch(error){
            return res.status(500).json(error)
        }
    }
}