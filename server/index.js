import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

const app = express();
let PORT = process.env.APP_PORT;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});
