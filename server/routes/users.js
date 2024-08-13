const express = require("express");
const yup = require("yup");
const { Op, Sequelize } = require("sequelize");
const { User } = require("../models");
const { validateToken } = require("../middlewares/auth");
const argon2 = require("argon2");
const router = express.Router();
const { sign } = require("jsonwebtoken");
const multer = require("multer");
const sharp = require("sharp");
const { sendPasswordResetEmail } = require("../connections/mailersend");
const fs = require("fs");
const {
  generatePasswordResetToken,
} = require("../security/generatePasswordResetToken");

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
  townCouncil: yup.string().trim().max(30).required(),
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
  townCouncil: yup.string().trim().max(30),
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
      { id: { [Op.like]: `%${search}%` } },
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { phoneNumber: { [Op.like]: `%${search}%` } },
      { townCouncil: { [Op.like]: `%${search}%` } },
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

router.put("/request-reset-password/:email", async (req, res) => {
  let email = req.params.email;

  try {
    console.log(email);
    let user = await User.findOne({
      where: { email: email },
    });

    if (!user) {
      res.sendStatus(404);
      return;
    }

    if (user.isArchived) {
      res.status(400).json({
        message: `ERR_ACC_IS_ARCHIVED`,
      });
    } else {
      const token = await generatePasswordResetToken();
      let num = await User.update(
        {
          resetPasswordToken: token,
          resetPasswordExpireTime: Date.now() + 3600000,
          // resetPasswordExpireTime: Date.now() + 3600000,
          // GENERICMARKER
        },
        {
          where: { id: user.id },
        }
      );

      if (num == 1) {
        res.json({
          message: "User was updated successfully.",
        });
      } else {
        res.status(400).json({
          message: `Something went wrong setting token for user with id ${id}.`,
        });
      }
      await sendPasswordResetEmail(user.email, user.firstName, token);

      res.status(200).json({ message: "Email sent successfully" });
      return;
    }
  } catch (error) {
    // Silence.
  }
});

router.post("/reset-password", async (req, res) => {
  let token = req.body.token;
  let newPassword = req.body.password;

  try {
    resetPassword(token, newPassword).then(() => {
      res.sendStatus(200);
    });
  } catch (err) {
    res.status(400).json({ errors: err.errors });
  }
});

router.get("/reset-password/:token", async (req, res) => {
  let token = req.params.token;
  try {
    let user = await validateResetPasswordToken(token);

    if (!user) {
      console.log("no");
      res.sendStatus(404);
      return;
    } else {
      console.log("yes");
      res.sendStatus(200);
    }
  } catch {
    res.status(401);
  }
});

async function validateResetPasswordToken(token) {
  const user = await User.findOne({
    where: {
      resetPasswordToken: token,
      resetPasswordExpireTime: { [Sequelize.Op.gt]: Date.now() },
    },
  });

  if (!user) {
    return undefined;
  } else {
    return user;
  }
}

async function resetPassword(token, newPassword) {
  const user = await validateResetPasswordToken(token);

  if (!user) {
    return undefined;
  }

  const hashedPassword = await argon2.hash(newPassword);
  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
}

function readTownCouncilsFile() {
  try {
    const data = fs.readFileSync("assets/town_councils.json", "utf8");
    return data;
    // const parsedData = JSON.parse(data);
    // return parsedData;
  } catch (err) {
    console.error("Error reading JSON file:", err);
    return null;
  }
}

router.get("/town-councils-metadata", async (req, res) => {
  try {
    let result = readTownCouncilsFile();
    res.json(result);
  } catch {
    res.status(401);
  }
});

module.exports = router;
