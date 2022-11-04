import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import scrapRoute from "./routers/scrap.js";
import mongoose from "mongoose";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 1111;

// mongoose config
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to mongo db");
  })
  .catch((err) => {
    console.log("connect to mongo db failed\n", err);
  });

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// ROUTES
app.use("/", scrapRoute);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
