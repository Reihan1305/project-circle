import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import router from "./routes/route";
import bodyParser from "body-parser";
import { redisConnect } from "./cache/redis";


const app = express();
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config();

const corsOption = {
  origin: "*",
  METHODS: "GET,POST,PUT,DELETE,PATCH,HEAD",
  prefligthcontinue: false,
  optionSuccesStatus: 204,
};

app.use(cors(corsOption));

app.use("/api/circle", router);

app.listen(process.env.PORT, () => {
  redisConnect();
  console.log(`server running in PORT :${process.env.PORT}`);
});
