import { PrismaClient } from "@prisma/client";
import { Request,Response } from "express";
import { threadId } from "worker_threads";

const prisma = new PrismaClient()

const validUuid = (uuid : string):boolean =>{
    const UUIDRegex =
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
  return UUIDRegex.test(uuid);
}

export default new class LikeService{
    private readonly userRepository = prisma.user
    private readonly likeRepository = prisma.like
    private readonly threadRepository = prisma.thread

    async like(req:Request,res:Response):Promise<Response>{
        try{
            const threadId = req.params.threadId

            if(!validUuid(threadId))return res.status(201).json({message : "invalid thread uuid"})

            const userId = res.locals.loginSession.User.id
            
            const userSelected = await this.userRepository.findUnique({
                where:{id:userId}
            })

            if(!userSelected) return res.status(401).json({message:"user not found"})

            const threadSelected = await this.threadRepository.findUnique({
                where:{id:threadId},
                include:{
                    like:true
                }
            })

            if(!threadSelected)return res.status(404).json({message :"thread not found"})

            const exitingLike = threadSelected.like.find(like => like.userId === userId)

            if(exitingLike){
                await this.likeRepository.delete({
                    where:{id :exitingLike.id}
                })

                await this.threadRepository.update({
                    where:{id:threadId},
                    data:{
                        isliked:false
                    }
                })

                return res.status(201).json({
                    code:201,
                    status:"success",
                    message:"delete like thread succes"
                })
            }

            const likeThread = await this.likeRepository.create({
                data:{
                    userId:userSelected.id,
                    threadId:threadSelected.id
                }
            })

            await this.threadRepository.update({
                where:{id:threadId},
                data:{
                    isliked:true
                }
            })

            return res.status(201).json({code:201,status:"sucess",message:"like succes",data:likeThread})
        }catch(error){
            return res.status(500).json({
                message:error
            })
        }
    }
}