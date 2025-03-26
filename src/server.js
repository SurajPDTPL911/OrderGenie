import dotenv from "dotenv";
dotenv.config();
import express from "express";
import  { initDb }  from "./config/prismaClient.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger, errorHandler } from "./middleware/logEvents.js";
import Routes from "./routes.js";
import './utils/resetScheduler.js';
import status from 'express-status-monitor'

const app = express();

const PORT = process.env.PORT || 8000;

const whiteList = ["https://www.google.com", "http://localhost:5173", "http://localhost:8080" ];
const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {      
      const error = new Error("Not allowed by CORS!");
      callback(error);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length", "X-Custom-Header"],
  credentials: true,
  maxAge: 600,
  optionsSuccessStaus: 200,
};

app.use(express.json());

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(logger);

app.use(status());

app.use("/api", Routes);

app.get("/", (req, res) => {
  res.send("Server is running.....");
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await initDb(); 
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.log("Server failed to start", err);
  }
};

startServer();
