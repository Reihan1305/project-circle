import { Request,Response } from "express";
import { PrismaClient } from "@prisma/client";
import {v4 as uuidv4} from "uuid";
import *as bcrypt from "bcrypt";
import cloudinary from "../config";
import *as fs from "fs";
import { update } from "../utils/AuthUtils";

const prisma = new PrismaClient()

const validUuid = (uuid : string):boolean=>{
    const UUIDRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i
    return UUIDRegex.test(uuid)
}

export default new class UserService{
    private readonly userRepository = prisma.user;
    private readonly threadRepository = prisma.thread;
    private readonly replyRepository = prisma.reply;
    private readonly likeRepository = prisma.like;
    private readonly userFolowingRepository = prisma.userFolowing;
    
    async findAll(req:Request, res:Response):Promise<Response>{
        try{
            const page = parseInt(req.params.page) || 1;
            const pagesize = 10;

            const skip = (page - 1) * pagesize

            const users = await this.userRepository.findMany({
                skip,
                take:pagesize
            })

            const totaluser = await this.userRepository.count()

            const totalpage = Math.ceil(page / totaluser)

            if(page > totalpage) return res.status(404).json({message:"page not found"})

            const userPages = {
                users,
                pagination:{
                    totaluser,
                    totalpage,
                    curentpage:page,
                    pagesize
                }

            }
            return res.status(201).json({code:201,status:"success",message:"find all success",data:userPages})
        }catch(error){
            return res.status(500).json(error)
        }
    }

    async findById(req:Request, res:Response):Promise<Response> {
        try {
            const userId = req.params.userId

            if (!validUuid(userId)) {
                return res.status(400).json({ message: "Invalid UUID" })
            }

            const users = await this.userRepository.findUnique({
                where: {
                    id: userId
                },
                include: {
                    threads: true,
                    like: true,
                    replies: true,
                    following: true,
                    follower: true,
                }
            })

            if (!users) return res.status(404).json({ message: "User not found" })

            return res.status(200).json({
                code: 200,
                status: "Success",
                message: "Find By ID User Success",
                data: users
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: error })
        }
    }

    async findByName(req:Request, res:Response):Promise<Response>{
        try{
            const name = req.params.name

            const userByName = await this.userRepository.findMany({
                where:{fullname:name}
            })

            if(!userByName)return res.status(404).json({message:"user not found"})

            return res.status(201).json({code:201,status:"success",message:"findbyname success",data:userByName})
        }catch(error){
            return res.status(500).json(error)
        }
    }

    async updateWithoutImage (req:Request, res:Response):Promise<Response>{
        try{
            const userId = req.params.userId

            if(!validUuid(userId)) return res.status(401).json({message:"Invalid uuid"})

            const session = res.locals.loginSession.User.id

            if(userId !== session)return res.status(400).json({message:"unauthorization : invalid id"})

            const user = await this.userRepository.findUnique({
                where:{id:userId}
            })

            if(!user)return res.status(401).json({message:"user not found"})

            const body = req.body;
            const {error} = update.validate(body)

            if(error)return res.status(400).json({message:error})

            let hashpassword = user.password
            let bio = user.bio
            let fullname =user.fullname
            let username = user.username

            const id = uuidv4()
            const uuidPart = id.substring(0,8).replace(/-/,' ')

            if(body.password !== undefined && body.password !== ""){
                hashpassword = await bcrypt.hash(body.password , 10)
            }

            if(body.fullname !== undefined && body.fullname !== ""){
                fullname = body.fullname
                username = `user_${uuidPart}_${fullname.replace(/\s/, '_')}`
            }

            if(body.bio !== undefined && body.bio !== ""){
                bio = body.bio
            }

            const updateUser = await this.userRepository.update({
                where:{id:userId},
                data:{
                    password:hashpassword,
                    fullname:fullname,
                    username:username,
                    bio:bio
                }
            })

            return res.status(201).json({
                code: 201,
                status: "Success",
                message: "Upload Data Profile Success",
                data: updateUser
            })
        }catch(error){
            return res.status(500).json({message : error})
        }
    }
    async uploadProfilePicture(req:Request, res:Response):Promise<Response>{
        try{
            const userId = req.params.userId

            if(!validUuid(userId))return res.status(401).json({message:"invalid id"})

            const session = res.locals.loginSession.User.id
            if(session !== userId)return res.status(401).json({meesage:"UNAUTHORIZATION : invalid ID"})

            const image = req.file
            if(!image)return res.status(401).json({message :"image provide"})

            const oldUserData = await this.userRepository.findUnique({
                where:{id:userId},
                select:{photoprofil:true}
            })

            const cloudinaryUpload = await cloudinary.uploader.upload(image.path ,{
                folder:"circle53"
            })
            
            const profilePicture = cloudinaryUpload.secure_url

            fs.unlinkSync(image.path)

            if(oldUserData && oldUserData.photoprofil){
                const publicId = oldUserData.photoprofil.split('/').pop()?.split('.')[0]
                await cloudinary.uploader.destroy(publicId as string)
            }

            const updateUser = await this.userRepository.update({
                where:{id:userId},
                data:{photoprofil:profilePicture}
            })

            return res.status(201).json({
                status:"success",
                code:201,
                message:"update profile picture successfully",
                data:updateUser
            })

        }catch(error){
            return res.status(500).json(error)
        }
    }

    async getSugestedUser (req:Request,res:Response):Promise<Response>{
        try{
            const limit =parseInt(req.query.limits as string) || 5
            
            const user = await this.userRepository.findMany({
                take:limit,
                skip:Math.floor(Math.random()*5),
                select:{
                    id:true,
                    username:true,
                    fullname:true,
                    photoprofil:true,
                    following:true
                }
            })

            return res.status(201).json({
                code:201,
                status:"success",
                message:"get sugested user success",
                data:user
            })
        }catch(error){
            return res.status(500).json(error)
        }
    }

    async deleteUser(req:Request, res:Response):Promise<Response>{
        try{
            const userId = req.params.userId

            if(!validUuid(userId))return res.status(401).json({message:"invalid user id"})

            const session = res.locals.loginSession.User.id

            if(session != userId)return res.status(401).json({message:"UNAUTHORIZATION : you'are not user login"})

            const userDelete = await this.userRepository.findUnique({
                where:{id:userId},
                include:{
                    threads:true,
                    like:true,
                    replies:true
                }
            })

            if(!userDelete)return res.status(404).json({message:"user not found"})

            await this.userFolowingRepository.deleteMany({
                where:{
                    OR:[
                        {followerid:userId},
                        {followingid:userId}
                    ]
                }
            })

            await Promise.all([
                this.threadRepository.deleteMany({where:{userId:userId}}),
                this.replyRepository.deleteMany({where:{userId:userId}}),
                this.likeRepository.deleteMany({where:{userId:userId}})
            ])

            const deleteUser = await this.userRepository.delete({
                where:{id:userId}
            })

            return res.status(201).json({
                code:201,
                status:"success",
                message:"delete successfully",
                data:deleteUser
            })
        }catch(error){
            return res.status(500).json(error)
        }
    }
}
