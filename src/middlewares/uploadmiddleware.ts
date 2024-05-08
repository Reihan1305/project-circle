import multer from "multer";
import path from "path";

const strorage =multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, path.join(__dirname,"../uploads"))
    },
    filename:(req,file,cb)=>{
        const uniquesuffix = Date.now() + '-' + Math.round(Math.random() *1e9)
        cb(null, file.fieldname + uniquesuffix + path.extname(file.originalname))
    }
})

const fileFilter = (req:any,file:any,cb:any) =>{
    if(file.mimetype.startsWith("image/")){
        cb(null,true)
    }else{
        cb(new Error("file type not support"), false)
    }
}

const upload = multer ({
    storage:strorage,
    fileFilter:fileFilter,
    limits:{
        fileSize:1024*1024*5
    }
})

export default upload