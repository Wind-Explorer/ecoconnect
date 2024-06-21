const express = require("express");
const yup = require("yup");
const { Op } = require("sequelize");
const { User } = require("../models");
const router = express.Router();

router.post("/", async (req, res) => {
  let data = req.body;
  // Validate request body
  let validationSchema = yup.object({
    id: yup.number().min(0).required(),
    firstName: yup.string().trim().min(1).max(100).required(),
    lastName: yup.string().trim().min(1).max(100).required(),
    email: yup.string().trim().min(5).max(69).email().required(),
    phoneNumber: yup.string().trim().length(8).required(),
    passwordHash: yup.string().trim().min(128).max(255).required(),
    description: yup.string().trim().min(3).max(500).required(),
  });
  try {
    data = await validationSchema.validate(data, { abortEarly: false });
    // Process valid data
    let result = await User.create(data);
    res.json(result);
  } catch (err) {
    res.status(400).json({ errors: err.errors });
  }
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
