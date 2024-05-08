import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import * as bcyrpt from "bcrypt"
import * as jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import { register, login } from "../utils/AuthUtils"


const prisma = new PrismaClient()

export default new class AuthService {
    private readonly AuthRepository = prisma.user

    async register(req: Request, res: Response): Promise<Response> {
        try {
            const body = req.body
            const { error } = register.validate(body)
            if (error) return res.status(400).json(error.message)

            const isMailRegisted = await this.AuthRepository.count({ where: { email: body.email } })
            if (isMailRegisted > 0) return res.status(400).json({ message: "Email already registed!" })

            const hashPassword = await bcyrpt.hash(body.password, 10)

            // 4367ffdf-b1a9-4169-ad1e-e86632f6ad88
            const id = uuidv4()
            const usernameUUIDpart = id.substring(0, 8).replace(/-/g, '')
            const uconvert = `user_${usernameUUIDpart}_${body.fullname.replace(/\s/g, '_')}`

            // fullname : Arre Pangestu
            // username : user_12345678_Arre_pangestu

            const Auth = await this.AuthRepository.create({
                data: {
                    username: uconvert,
                    fullname: body.fullname,
                    email: body.email,
                    password: hashPassword,
                    photoprofil: "",
                    bio: "",
                    createdAt: new Date()
                }
            })

            return res.status(201).json({
                code :201,
                message:"register success",
                status:"success",
                data:Auth
             })

        } catch (error) {
            console.log(error);
            return res.status(500).json(error)
        }
    }



    async login(req: Request, res: Response): Promise<Response> {
        try {
            const body = req.body
            const { value, error } = login.validate(body)
            if (error) return res.status(400).json(error.message)

            const isMailRegisted = await this.AuthRepository.findFirst({ where: { email: body.email } })
            if (!isMailRegisted) return res.status(409).json({ message: "Email isnt Registed!" })

            const isMatchPassword = await bcyrpt.compare(value.password, isMailRegisted.password)
            if (!isMatchPassword) return res.status(409).json({ message: "Incorect Password!" })

            const User = {
                id: isMailRegisted.id,
                password: isMailRegisted.password,
                username: isMailRegisted.username,
                fullname: isMailRegisted.fullname,
                profilePicture: isMailRegisted.photoprofil,
                bio: isMailRegisted.bio,
            }

            const token = jwt.sign({ User }, 'secretKey', { expiresIn: 999999 })

            return res.status(201).json({
                code:201,
                status:"success",
                message :"login succes",
                token
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json(error)
        }
    }

    async check (req:Request, res:Response){
        try{
            const user = await this.AuthRepository.findUnique({
                where:{id: res.locals.loginSession.User.id}
            })

            if(!user)return res.status(404).json({message:"user not login"})

            return res.status(201).json({
                code:201,
                status:"success",
                message:"user have login session"
            })

        }catch (error) {
            console.log(error);
            return res.status(500).json(error)
        }
    }

    async logout(req: Request, res: Response) {
        try {
            localStorage.clear()

            return res.status(200).json({
                code: 200,
                status: "Success",
                message: "Logout Success",
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Gagal melakukan logout" })

        }
    }
}