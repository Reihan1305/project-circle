import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cloudinary from "../config";
import * as fs from "fs";
import { thread } from "../utils/threadUtils";
import amqp from "amqplib"

const prisma = new PrismaClient();

export default new class Threadqueue {
  private readonly userRepository = prisma.user;
  private readonly threadRepository = prisma.thread;

  async addThreadqueue (req: Request, res: Response): Promise<Response> {
    try {
      const body = req.body;
      const { error } = thread.validate(body)
      if (error) return res.status(400).json({ message: error.message })

      const userId = res.locals.loginSession.User.id

      const userSelect = await this.userRepository.findUnique({
          where: { id: userId }
      })
      if (!userSelect) return res.status(404).json({ message: "User not found" })

      let image = req.file
      let image_url = ""

      if (!image) {
          image_url = ""
      } else {
          const cloudinaryUpload = await cloudinary.uploader.upload(image.path, {
              folder: "circle53"
          })
          image_url = cloudinaryUpload.secure_url
          fs.unlinkSync(image.path)
      }

      const payload ={
        content : body.content,
        image :image_url,
        id:userId
      }

      const connection = await amqp.connect("amqp://localhost");
      const channel = await connection.createChannel()

      await channel.assertQueue("Thread_circle_queue");
      channel.sendToQueue("Thread_circle_queue", Buffer.from(JSON.stringify(payload)))

      let rabbitData

      const messageProssesed = new Promise<void>((resolve, rejects) =>{
        channel.consume("Thread_circle_queue", async(message)=>{
            if(message){
                try{
                    const payload = JSON.parse(message.content.toString())
                    const rabbit = await this.threadRepository.create({
                        data: {
                            content: body.content,
                            image: image_url,
                            createdAt: new Date(),
                            createdBy: { connect: { id: userId } }
                        }
                    })

                    console.log(message.content.toString());
                    
                    rabbitData = rabbit
                    channel.ack(message)
                    resolve()
                }catch(error){
                    console.log(error);
                    rejects(error)
                }
            }
        })
      })

      await messageProssesed
      await channel.close()
      await connection.close()

      return res.status(201).json({
          code: 201,
          status: "Success",
          message: "Add Threads Success",
          data: rabbitData
      })

    } catch (error) {
      return res.status(500).json({ messsage: error });
    }
  }
}