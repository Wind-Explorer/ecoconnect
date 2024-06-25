const express = require("express");
const yup = require("yup");
const { Op } = require("sequelize");
const { User } = require("../models");
const { validateToken } = require("../middlewares/auth");
const argon2 = require("argon2");
const router = express.Router();
const { v4: uuidV4 } = require("uuid");
const { sign } = require("jsonwebtoken");

require("dotenv").config();

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

let optionalValidationSchema = yup.object({
  id: yup.string().trim().min(36).max(36).required(),
  firstName: yup.string().trim().min(1).max(100),
  lastName: yup.string().trim().min(1).max(100),
  email: yup.string().trim().min(5).max(69).email(),
  phoneNumber: yup
    .string()
    .trim()
    .matches(/^[0-9]+$/)
    .length(8),
  password: yup.string().trim().max(100),
});

router.post("/register", async (req, res) => {
  let data = req.body;
  let user = await User.findOne({
    where: { email: data.email },
  });
  if (user) {
    res.status(400).json({ message: "Email already exists." });
    return;
  }
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

router.get("/all", async (req, res) => {
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

router.get("/individual/:id", validateToken, async (req, res) => {
  let id = req.params.id;
  let user = await User.findByPk(id);
  if (!user) {
    res.sendStatus(404);
    return;
  }
  res.json(user);
});

router.put("/individual/:id", validateToken, async (req, res) => {
  let id = req.params.id;
  let user = await User.findByPk(id);

  if (!user) {
    res.sendStatus(404);
    return;
  }

  let data = req.body;

  try {
    data = await optionalValidationSchema.validate(data, { abortEarly: false });

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

router.delete("/individual/:id", validateToken, async (req, res) => {
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

router.post("/login", async (req, res) => {
  let data = req.body;
  let errorMessage = "Email or password is not correct.";

  let user = await User.findOne({
    where: { email: data.email },
  });

  if (!user) {
    res.status(400).json({ message: errorMessage });
    return;
  }

  let match = await argon2.verify(user.password, data.password);
  if (!match) {
    res.status(400).json({ message: errorMessage });
    return;
  }

  let userInfo = {
    id: user.id,
    email: user.email,
    name: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };

  let accessToken = sign(userInfo, process.env.APP_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRES_IN,
  });

  res.json({
    accessToken: accessToken,
  });
});

router.get("/auth", validateToken, (req, res) => {
  res.json({
    id: req.user.id,
  });
});

module.exports = router;
