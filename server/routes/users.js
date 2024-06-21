const express = require("express");
const { Op } = require("sequelize");
const { User } = require("../models");
const router = express.Router();

router.post("/", async (req, res) => {
  let data = req.body;
  let result = await User.create(data);
  res.json(result);
});

router.get("/", async (req, res) => {
  let condition = {};
  let search = req.query.search;
  if (search) {
    condition[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  let list = await User.findAll({
    where: condition,
    order: [["createdAt", "DESC"]],
  });
  res.json(list);
});

module.exports = router;
