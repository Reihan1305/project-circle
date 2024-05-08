import { Request,Response } from "express";
import { PrismaClient } from "@prisma/client";
import cloudinary from "../config";
import * as fs from "fs";
import { reply } from "../utils/replyUtils";

const prisma = new PrismaClient()

const validUuid = (uuid : string):boolean =>{
    const UUIDRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i
    return UUIDRegex.test(uuid)
}

export default new class ReplyService {
    private readonly userRepository = prisma.user
    private readonly replyRepository = prisma.reply
    private readonly threadRepository = prisma.thread

    async addReply(req :Request, res:Response):Promise<Response>{
        try{
            const threadId = req.params.threadId;
            if(!validUuid(threadId))return res.status(400).json({message:"invalid id"})

            const userId = res.locals.loginSession.User.id

            const userSelect = await this.userRepository.findUnique({
                where:{id:userId}
            })

            if(!userSelect)return res.status(404).json({message:"user not found"})
            
            const threadSelect = await this.threadRepository.findUnique({
                where:{id:threadId}
            })

            if(!threadSelect)return res.status(404).json({message:"thread not found"})
            const body = req.body

            const {error} = reply.validate(body)
            if(error)return res.status(400).json({message:error.message})
 
            let image = req.file
            let image_url =""
    
            if(!image){
                image_url = ""
            }else{
                const cloudinaryUpload = await cloudinary.uploader.upload(image.path,{
                    folder:"circle53"
                })
               image_url = cloudinaryUpload.secure_url
                fs.unlinkSync(image.path)
            }

            const newReply = await this.replyRepository.create({
                data:{
                    content:body.content,
                    image:image_url,
                    createdBy: {connect :{id:userId}},
                    thread:{connect :{id:threadId}}
                }
            })

            await this.threadRepository.update({
                where:{id:threadId},
                data:{
                        replies :{connect :{id :newReply.id}}
                }
            })

            return res.status(201).json({
                code:201,
                status:"success",
                message:"add reply success",
                data:newReply
            })
        }catch(error){
            return res.status(500).json({message:error})
        }
    }
    async updateReply(req:Request,res:Response):Promise<Response>{
        try{
            const {threadId, replyId} = req.params

            if(!validUuid(threadId)&& !validUuid(replyId))return res.status(400).json({message:"invalid uuid"})

            const userId = res.locals.loginSession.User.id

            const userSelect = await this.userRepository.findUnique({
                where:{id:userId}
            })

            if(!userSelect)return res.status(404).json({message:"user not found"})
            
            const threadSelect = await this.threadRepository.findUnique({
                where:{id:threadId}
            })

         if(!threadSelect)return res.status(404).json({message:"thread not found"})
    
            const replySelect = await this.replyRepository.findUnique({
                where:{id:replyId}
            })

         if(!replySelect)return res.status(404).json({message:"thread not found"})
        
            const body = req.body

            const {error} = reply.validate(body)
            if(error)return res.status(400).json({message:error.message})
 
            let image = req.file
            let image_url =""
    
            const oldDataReply = await this.replyRepository.findUnique({
                where:{id:replyId},
                select:{image:true}
            })
            if(image){
            const cloudinaryUpload = await cloudinary.uploader.upload(image.path,{
                folder:"circle53"
            })
           image_url = cloudinaryUpload.secure_url
            fs.unlinkSync(image.path)
            if(oldDataReply && oldDataReply.image){
                const publicId = oldDataReply.image.split('/').pop()?.split('.')[0]
                await cloudinary.uploader.destroy(publicId as string)
            }
        }else{
            image_url = oldDataReply?.image || ""
        }

        const updateReply = await this.replyRepository.update({
            where:{id:replyId},
            data:{
                content:body.content,
                image:image_url,
                createdAt:new Date()
            }
        })

        return res.status(201).json({
            code:201,
            status:"success",
            message:"update reply success",
            data:updateReply
        })
        }catch(error){
            return res.status(500).json({message:error})
        }
    }

    async deleteReply(req:Request, res:Response):Promise<Response>{
        try{
            const replyId = req.params.replyId
            if(!validUuid(replyId))return res.status(400).json({meesage:"invalid thread id"})
            const userId = res.locals.loginSession.User.id
            
            const userSelect = await this.userRepository.findUnique({
                where:{id:userId}
            })

            if(!userSelect) return res.status(404).json({message:"user not found"})

            const oldDataReply = await this.replyRepository.findUnique({
                where:{id:replyId},
                select:{image:true}
            })

            if(oldDataReply && oldDataReply.image){
                const publicId = oldDataReply.image.split('/').pop()?.split('.')[0]
                await cloudinary.uploader.destroy(publicId as string)
            }

            const deleteReply = await this.replyRepository.delete({
                where:{id:replyId}
            })

            return res.status(201).json({
                code:201,
                status:"success",
                message:"delete thread success",
                data:deleteReply
            })
        }catch(error){
            return res.status(500).json({messsage:error})
        }
    }
}


