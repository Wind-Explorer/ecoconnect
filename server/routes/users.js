import { Router } from "express";
const router = Router();

let usersList = [];

router.post("/", (req, res) => {
  let data = req.body;
  usersList.push(data);
  res.json(data);
});

router.get("/", (req, res) => {
  res.json(usersList);
});

export default router;
