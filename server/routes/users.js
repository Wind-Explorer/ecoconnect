const express = require("express");
const yup = require("yup");
const { Op } = require("sequelize");
const { User } = require("../models");
const { validateToken } = require("../middlewares/auth");
const argon2 = require("argon2");
const router = express.Router();
const { sign } = require("jsonwebtoken");
const multer = require("multer");
const sharp = require("sharp");

require("dotenv").config();

let validationSchema = yup.object({
  firstName: yup.string().trim().min(1).max(100).required(),
  lastName: yup.string().trim().min(1).max(100).required(),
  email: yup.string().trim().email().max(69).required(),
  phoneNumber: yup
    .string()
    .trim()
    .matches(/^[0-9]{8}$/, "Must be exactly 8 digits")
    .required(),
  password: yup.string().trim().max(100).required(),
  profilePicture: yup.string().trim().max(255),
});

let optionalValidationSchema = yup.object({
  firstName: yup.string().trim().min(1).max(100),
  lastName: yup.string().trim().min(1).max(100),
  email: yup.string().trim().email().max(69),
  phoneNumber: yup
    .string()
    .trim()
    .matches(/^[0-9]{8}$/, "Must be exactly 8 digits"),
  password: yup.string().trim().max(100),
  profilePicture: yup.string().trim().max(255),
});

router.post("/register", async (req, res) => {
  let data = req.body;

  let userByEmail = await User.findOne({
    where: { email: data.email },
  });
  let userByNumber = await User.findOne({
    where: { phoneNumber: data.phoneNumber },
  });

  if (userByEmail || userByNumber) {
    res.status(400).json({ message: "Email or phone number already exists." });
    return;
  }
  try {
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
    attributes: { exclude: ["password", "profilePicture"] },
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

  if (user.isArchived) {
    res.status(400).json({
      message: `ERR_ACC_IS_ARCHIVED`,
    });
  } else {
    user.password = undefined;
    user.profilePicture = undefined;
    res.json(user);
  }
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

router.put("/archive/:id", validateToken, async (req, res) => {
  let id = req.params.id;
  let user = await User.findByPk(id);

  if (!user) {
    res.sendStatus(404);
    return;
  }

  try {
    await User.update(
      { isArchived: true },
      {
        where: { id: id },
      }
    );
    res.json({
      message: "User archived successfully.",
    });
  } catch (err) {
    res.status(400).json({ errors: err.errors });
  }
});

router.put("/unarchive/:id", validateToken, async (req, res) => {
  let id = req.params.id;
  let user = await User.findByPk(id);

  if (!user) {
    res.sendStatus(404);
    return;
  }

  try {
    await User.update(
      { isArchived: false },
      {
        where: { id: id },
      }
    );
    res.json({
      message: "User archived successfully.",
    });
  } catch (err) {
    res.status(400).json({ errors: err.errors });
  }
});

router.get("/profile-image/:id", async (req, res) => {
  let id = req.params.id;
  let user = await User.findByPk(id);

  if (!user || !user.profilePicture) {
    res.sendStatus(404);
    return;
  }

  try {
    res.set("Content-Type", "image/jpeg"); // Adjust the content type as necessary
    res.send(user.profilePicture);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving profile image", error: err });
  }
});

const upload = multer({ storage: multer.memoryStorage() });

router.put(
  "/profile-image/:id",
  validateToken,
  upload.single("image"),
  async (req, res) => {
    const id = req.params.id;

    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const { buffer, mimetype, size } = req.file;

      // Validate file type and size (example: max 5MB, only images)
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(mimetype)) {
        return res.status(400).json({
          message:
            "Invalid file type\nSupported: jpeg, png, gif\nUploaded: " +
            mimetype.substring(6),
        });
      }

      if (size > maxSize) {
        return res.status(400).json({
          message:
            "File too large!\nMaximum: 5MB, Uploaded: " +
            (size / 1000000).toFixed(2) +
            "MB",
        });
      }

      // Crop the image to a square
      const croppedBuffer = await sharp(buffer)
        .resize({ width: 512, height: 512, fit: sharp.fit.cover }) // Adjust size as necessary
        .toBuffer();

      // Update user's profile picture
      await User.update(
        { profilePicture: croppedBuffer },
        { where: { id: id } }
      );

      res.json({ message: "Profile image uploaded and cropped successfully." });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Internal server error", errors: err.errors });
    }
  }
);

module.exports = router;
