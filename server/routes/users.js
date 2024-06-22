const express = require("express");
const yup = require("yup");
const { Op } = require("sequelize");
const { User } = require("../models");
const router = express.Router();

let validationSchema = yup.object({
  id: yup.number().min(0).required(),
  firstName: yup.string().trim().min(1).max(100).required(),
  lastName: yup.string().trim().min(1).max(100).required(),
  email: yup.string().trim().min(5).max(69).email().required(),
  phoneNumber: yup.string().trim().length(8).required(),
  passwordHash: yup.string().trim().min(128).max(255).required(),
});

router.post("/", async (req, res) => {
  let data = req.body;
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

router.get("/:id", async (req, res) => {
  let id = req.params.id;
  let user = await User.findByPk(id);
  if (!user) {
    res.sendStatus(404);
    return;
  }
  res.json(user);
});

router.put("/:id", async (req, res) => {
  let id = req.params.id;
  let user = await User.findByPk(id);

  if (!user) {
    res.sendStatus(404);
    return;
  }

  let data = req.body;

  try {
    data = await validationSchema.validate(data, { abortEarly: false });

    let num = await User.update(data, {
      where: { id: id },
    });

    if (num == 1) {
      res.json({
        message: "User was updated successfully.",
      });
    } else {
      res.status(400).json({
        message: `Cannot update tutorial with id ${id}.`,
      });
    }
  } catch (err) {
    res.status(400).json({ errors: err.errors });
  }
});

router.delete("/:id", async (req, res) => {
  let id = req.params.id;
  let num = await User.destroy({
    where: { id: id },
  });
  if (num == 1) {
    res.json({
      message: "User was deleted successfully.",
    });
  } else {
    res.status(400).json({
      message: `Cannot delete user with id ${id}.`,
    });
  }
});

module.exports = router;
