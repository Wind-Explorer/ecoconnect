import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import usersRoute from "./routes/users.js";

dotenv.config();

const app = express();
let PORT = process.env.APP_PORT;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to ecoconnect.");
});

app.use("/users", usersRoute);

app.listen(PORT, () => {
  console.log(`ecoconnect server running at http://localhost:${PORT}/`);
});
