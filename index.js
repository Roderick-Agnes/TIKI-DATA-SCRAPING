import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import scrapRoute from "./routers/scrap.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 1111;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// ROUTES
app.use("/", scrapRoute);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
