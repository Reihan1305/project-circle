import  { Express,Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cloudinary from "../config";
import * as fs from "fs";
import { thread } from "../utils/threadUtils";
import redisClient, {DEFAULT_EXPIRATION} from "../cache/redis"

const prisma = new PrismaClient();

const validUuid = (uuid: string): boolean => {
  const UUIDRegex =
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
  return UUIDRegex.test(uuid);
};

let isRedisConnected = false

async function redisConnectedDone () {
  if(!isRedisConnected){
    try{
      await redisClient.connect()
      isRedisConnected = true
    }catch(error){
      console.log(~`Error cannot connect to redis ${error}`);
      
    }
  }
}

export default new class ThreadService {
  private readonly userRepository = prisma.user;
  private readonly threadRepository = prisma.thread;

     async findAllRedis(req: Request, res: Response): Promise<Response> {
        try {
            redisConnectedDone()
            const page = parseInt(req.params.page) || 1
            const pageSize = 10
            const skip = (page - 1) * pageSize

            const cacheKey = `threads_page_${page}`
            if (!cacheKey) return res.status(404).json({ message: "KEY not Found" })

            const cacheData = await redisClient.get(cacheKey)

            if (cacheData) {
                const threads = JSON.parse(cacheData)

                const findthreads = await this.threadRepository.findMany({
                    skip,
                    take: pageSize,
                    include: {
                        createdBy: true,
                        like: true,
                        replies: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                })

                const totalThread = await this.threadRepository.count()
                const totalPages = Math.ceil(totalThread / pageSize)

                // Mengecek apakah data yang ada di database ada data baru atau tidak
                if (
                    threads.data.length === findthreads.length &&
                    threads.pagination.totalThread == totalThread &&
                    threads.pagination.totalPages == totalPages &&
                    findthreads.every((findthreads, index) =>
                        findthreads.content === threads.data[index].content &&
                        findthreads.image === threads.data[index].image
                    )
                ) {
                    // jika gak ada perubahan maka tampilkan data yang ada di redis
                    return res.status(200).json({
                        code: 200,
                        status: "Success",
                        message: "Find All CACHE Threads Success",
                        data: threads
                    })
                } else {
                    // jika ada perubahan, maka data yang ada di redis akan dihapus dan ngambil data baru
                    await redisClient.del(cacheKey)
                }
            }

            // Ngambil data ulang dari database
            const threads1 = await this.threadRepository.findMany({
                skip,
                take: pageSize,
                include: {
                    createdBy: true,
                    like: true,
                    replies: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })

            const totalThread = await this.threadRepository.count()
            const totalPages = Math.ceil(totalThread / pageSize)

            if (page > totalPages) return res.status(404).json({ message: "Page not found" })

            const threads2 = {
                data: threads1,
                pagination: {
                    totalThread,
                    totalPages,
                    currentPage: page,
                    pageSize
                }
            }

            redisClient.setEx(
                cacheKey,
                DEFAULT_EXPIRATION,
                JSON.stringify({
                    message: "Find All Cache Thread Success",
                    data: threads2.data,
                    pagination: threads2.pagination
                })
            )

            return res.status(200).json({
                code: 200,
                status: "Success",
                message: "Find All Threads Success",
                data: threads2
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: error })
        }
    }



  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.params.page) || 1;
      const pagesize = 10;
      const skip = (page - 1) * pagesize;

      const allThreads = await this.threadRepository.findMany({
        skip,
        take: pagesize,
        include: {
          like: true,
          createdBy: true,
          replies: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const totalthread = await this.threadRepository.count({});
      const totalpage = Math.ceil(totalthread / pagesize);

      if (totalpage < page)
        return res.status(404).json({ message: "page not found" });

      const threads = {
        data: allThreads,
        pagination: {
          totalthread,
          totalpage,
          currentpage: page,
          pagesize,
        },
      };

      return res.status(201).json({
        code: 201,
        status: "success",
        message: "find All thread success",
        data: threads,
      });

    } catch (error) {
      return res.status(500).json({ messsage: error });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const threadId = req.params.threadId;

      if (!validUuid(threadId))
        return res.status(401).json({ message: "invalid uuid" });

      const thread = await this.threadRepository.findUnique({
        where: { id : threadId },
        include: {
          createdBy: true,
          like: true,
          replies: {
            include: {
              createdBy: true,
            },
          },
        },
      });

      if (!thread) return res.status(404).json({ message: "thread not found" });

      return res.status(201).json({
        code: 201,
        status: "success",
        message: "find thread success",
        data: thread,
      });
    } catch (error) {
      return res.status(500).json({ messsage: error });
    }
  }

  async addThread(req: Request, res: Response): Promise<Response> {
    try {
      const body = req.body;
      const { error } = thread.validate(body)
      if (error) return res.status(400).json({ message: error.message })

      const userId = res.locals.loginSession.User.id

      const userSelect = await this.userRepository.findUnique({
          where: { id: userId }
      })
      if (!userSelect) return res.status(404).json({ message: "User not found" })

      const images:any = req.files
      let image_url:string[] = []
      
      if (!images) {
          image_url.push("") 
      } else {
        image_url = []
        for(const image of images){
          const newPath =  await cloudinary.uploader.upload(image.path, {
            folder: "circle53"
        })
        image_url.push(newPath.secure_url)
        fs.unlinkSync(image.path)
        }
      }
      
      const threads = await this.threadRepository.create({
          data: {
              content: body.content,
              image: image_url.toString(),
              createdAt: new Date(),
              createdBy: { connect: { id: userId } }
          }
      })

      return res.status(201).json({
          code: 201,
          status: "Success",
          message: "Add Threads Success",
          data: threads
      })

    } catch (error) {
      return res.status(500).json({ messsage: error });
    }
  }
  async updateThread(req: Request, res: Response): Promise<Response> {
    try {
      const threadId = req.params.threadId;
      if (!validUuid(threadId))
        return res.status(401).json({ Message: "invalid threadId" });

      const userId = res.locals.loginSession.User.id;

      const userSelect = await this.userRepository.findUnique({
        where: { id: userId },
      });

      if (!userSelect)
        return res.status(404).json({ message: "user not found" });
      const body= req.body;
      const { error } = thread.validate(body);
      if (error) return res.status(400).json({ message: error.message });

      let image:any = req.files;
      let image_url:any ;

      const oldDataThread = await this.threadRepository.findUnique({
        where: { id: threadId },
        select: { image: true },
      });

      console.log(oldDataThread?.image);
      if (image) {
       
        
        if (oldDataThread && oldDataThread.image) {
          const publicId = oldDataThread.image.split("/").pop()?.split(".").pop()?.split(",")[0];
          await cloudinary.uploader.destroy(publicId as string);
        }
      } else {
        image_url = oldDataThread?.image || "";
      }

      const threadUpdate = await this.threadRepository.update({
        where: { id: threadId },
        data: {
          content: body.content,
          image: image_url,
          createdAt: new Date(),
          createdBy: { connect: { id: userId } },
        },
      });

      return res.status(201).json({
        code: 201,
        status: "success",
        message: "update thread success",
        data: threadUpdate,
      });
    } catch (error) {
      return res.status(500).json({ messsage: error });
    }
  }

  async deleteThread(req: Request, res: Response): Promise<Response> {
    try {
      const threadId = req.params.threadId

      if (!validUuid(threadId)) {
          return res.status(400).json({ message: "Invalid UUID" })
      }

      const userId = res.locals.loginSession.User.id

      const userSelect = await this.userRepository.findUnique({
          where: { id: userId }
      })
      if (!userSelect) return res.status(404).json({ message: "User not found" })

      const oldThreadData = await this.threadRepository.findUnique({
          where: { id: threadId },
          select: { image: true }
      })

      if (oldThreadData && oldThreadData.image) {
          const publicId = oldThreadData.image.split('/').pop()?.split('.')[0]
          await cloudinary.uploader.destroy(publicId as string)
      }

      const deletethread = await this.threadRepository.delete({
          where: { id: threadId }
      })

      return res.status(200).json({
          code: 200,
          status: "Success",
          message: "Delete Threads Success",
          data: deletethread
      })
    } catch (error) {
      return res.status(500).json({ messsage: error });
    }
  }
}
