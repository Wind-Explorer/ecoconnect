const express = require("express");
const yup = require("yup");
const { Op } = require("sequelize");
const { User } = require("../models");
const argon2 = require("argon2");
const router = express.Router();
const { v4: uuidV4 } = require("uuid");

let validationSchema = yup.object({
  id: yup.string().trim().min(36).max(36).required(),
  firstName: yup.string().trim().min(1).max(100).required(),
  lastName: yup.string().trim().min(1).max(100).required(),
  email: yup.string().trim().min(5).max(69).email().required(),
  phoneNumber: yup
    .string()
    .trim()
    .matches(/^[0-9]+$/)
    .length(8)
    .required(),
  password: yup.string().trim().max(100).required(),
});

router.post("/", async (req, res) => {
  let data = req.body;
  try {
    data.id = uuidV4();
    data.password = await argon2.hash(data.password);

    console.log("Validating schema...");
    data = await validationSchema.validate(data, { abortEarly: false });

    console.log("Creating user...");
    let result = await User.create(data);
    res.json(result);
    console.log("Success!");
  } catch (err) {
    console.log("Error caught! Info: " + err);
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
  let user = await User.findByPk(id);

  if (!user) {
    res.sendStatus(404);
    return;
  }

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
