import * as express from "express";
import * as path from "path";
import authcontroller from "../controllers/authcontroller";
import upload from "../middlewares/uploadmiddleware";
import authmiddleware from "../middlewares/authmiddleware";
import usercontroller from "../controllers/usercontroller";
import likecontroller from "../controllers/likecontroller";
import followcontroller from "../controllers/followcontroller";
import threadcontroller from "../controllers/threadcontroller";
import replycontroller from "../controllers/replycontroller";

const router = express.Router();
router.use("/uploads", express.static(path.join(__dirname, "uploads")));

//auth
router.post("/register", authcontroller.register);
router.post("/login", authcontroller.login);
router.get("/check",authmiddleware.Authi, authcontroller.check);
router.delete("/logout",authmiddleware.Authi, authcontroller.logout);

//user
router.get("/findAllUser/:page", authmiddleware.Authi, usercontroller.findAll);
router.get("/findbyUserid/:userId",authmiddleware.Authi,usercontroller.findById);
router.get("/findbyname/:name",authmiddleware.Authi,usercontroller.findByName);
router.post("/updatewhitoutimage/:userId",authmiddleware.Authi,usercontroller.updateWhitoutImage);
router.post("/uploadprofilepicture/:userId",authmiddleware.Authi,upload.single("image"),usercontroller.uploadProfilePicture);
router.get("/getsugesteduser",authmiddleware.Authi,usercontroller.getSugesteduUser);
router.delete("/deleteuser/:userId",authmiddleware.Authi,usercontroller.deleteUser);

//like
router.post("/like/:threadId", authmiddleware.Authi, likecontroller.like);
//follow
router.post("/follow/:followId", authmiddleware.Authi, followcontroller.follow);

//thread
router.get("/findAllThread/:page",authmiddleware.Authi,threadcontroller.findAll);
router.get("/findThreadRedis/:page",authmiddleware.Authi,threadcontroller.findAllRedis);
router.get("/findThreadById/:threadId",authmiddleware.Authi,threadcontroller.findById);
router.post("/addThread",authmiddleware.Authi,upload.array("image", 10),threadcontroller.addThread);
router.post("/updateThread/:threadId",authmiddleware.Authi,upload.single("image"),threadcontroller.updateThread);
router.delete("/deletethread/:threadId",authmiddleware.Authi,threadcontroller.deleteThread);
//thread with queue
router.post("/addThreadqueue",authmiddleware.Authi,upload.single("image"),threadcontroller.addThreadqueue);
//reply
router.post("/addReply/:threadId/reply",authmiddleware.Authi,upload.single("image"),replycontroller.addReply);
router.post("/updateReply/:threadId/reply/:replyId",authmiddleware.Authi,upload.single("image"),replycontroller.updateReply);
router.delete("/deleteReply/:replyId",authmiddleware.Authi,replycontroller.deleteReply);
export default router;
