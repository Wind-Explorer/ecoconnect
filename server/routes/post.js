const express = require("express");
const router = express.Router();
const { Post, Comment, User } = require("../models");
const { Op, where } = require("sequelize");
const yup = require("yup");
const multer = require("multer");
const sharp = require("sharp");

// Profanity function
const Filter = require("bad-words"); // Import the bad-words library
const filter = new Filter();

var newBadWords = [
  "bloody",
  "bitch",
  "fucker",
  "fuck",
  "fk",
  "shit",
  "bastard",
  "dumbass",
  "stupid",
  "hell",
];
filter.addWords(...newBadWords);

let removeWords = [""];
filter.removeWords(...removeWords);

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/",
  upload.fields([{ name: "postImage", maxCount: 1 }]),
  async (req, res) => {
    let data = req.body;
    let files = req.files;

    // Validate request body
    let validationSchema = yup.object({
      title: yup.string().trim().min(3).max(200).required(),
      content: yup.string().trim().min(3).max(500).required(),
      userId: yup.string().required(),
      postImage: yup.string().trim().max(255),
    });
    try {
      data = await validationSchema.validate(data, { abortEarly: false });

      // Check for profanity
      if (filter.isProfane(data.title)) {
        return res
          .status(400)
          .json({ field: "title", error: "Profane content detected in title" });
      }
      if (filter.isProfane(data.content)) {
        return res.status(400).json({
          field: "content",
          error: "Profane content detected in content",
        });
      }

      let postImage = files.postImage ? files.postImage[0].buffer : null;

      // Resize and compress image if it exists
      if (postImage) {
        postImage = await sharp(postImage)
          .resize(512, 512, {
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .jpeg({ quality: 80 })
          .toBuffer();
      }

      // Process valid data
      let result = await Post.create({ ...data, postImage });
      res.json(result);
    } catch (err) {
      res.status(400).json({ errors: err.errors });
    }
  }
);

// // sequelize method findAll is used to generate a standard SELECT query which will retrieve all entries from the table
// router.get("/", async (req, res) => {
//     let list = await Tutorial.findAll({
//     // order option takes an array of items. These items are themselves in the form of [column, direction]
//     order: [['createdAt', 'DESC']]
//     });
//     res.json(list);
// });

router.get("/", async (req, res) => {
  let condition = {
    where: {},
    order: [["createdAt", "DESC"]],
  };

  let search = req.query.search;
  if (search) {
    condition.where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { content: { [Op.like]: `%${search}%` } },
    ];
  }
  // You can add condition for other columns here
  // e.g. condition.columnName = value;

  let list = await Post.findAll(condition);
  res.json(list);
});

router.get("/:id", async (req, res) => {
  let id = req.params.id;
  let post = await Post.findByPk(id);

  if (!post) {
    res.sendStatus(404);
    return;
  }
  res.json(post);
});

router.get("/post-image/:id", async (req, res) => {
  let id = req.params.id;
  let post = await Post.findByPk(id);

  if (!post || !post.postImage) {
    res.sendStatus(404);
    return;
  }

  try {
    res.set("Content-Type", "image/jpeg"); // Adjust the content type as necessary
    res.send(post.postImage);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving post image", error: err });
  }
});

router.put(
  "/:id",
  upload.fields([{ name: "postImage", maxCount: 1 }]),
  async (req, res) => {
    let id = req.params.id;
    let files = req.files;

    // Check id not found
    let post = await Post.findByPk(id);
    if (!post) {
      res.sendStatus(404);
      return;
    }

    let data = req.body;
    let postImage = files.postImage ? files.postImage[0].buffer : null;

    // Validate request body
    let validationSchema = yup.object({
      title: yup.string().trim().min(3).max(100),
      content: yup.string().trim().min(3).max(500),
      postImage: yup.mixed(),
    });
    try {
      data = await validationSchema.validate(data, { abortEarly: false });

      // Check for profanity
      if (filter.isProfane(data.title)) {
        return res
          .status(400)
          .json({ field: "title", error: "Profane content detected in title" });
      }
      if (filter.isProfane(data.content)) {
        return res.status(400).json({
          field: "content",
          error: "Profane content detected in content",
        });
      }

      // Include the postImage if present 
      if (postImage) {
        postImage = await sharp(postImage)
          .resize(512, 512, {
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .jpeg({ quality: 80 })
          .toBuffer();

        data.postImage = postImage;
      }

      // Process valid data
      let post = await Post.update(data, {
        // update() updates data based on the where condition, and returns the number of rows affected
        where: { id: id }, // If num equals 1, return OK, otherwise return Bad Request
      });
      if (post) {
        res.json({ message: "Post was updated successfully." });
      } else {
        res.status(400).json({
          message: `Cannot update post with id ${id}.`,
        });
      }
    } catch (err) {
      res.status(400).json({ errors: err.errors });
    }
  }
);

router.delete("/:id", async (req, res) => {
  let id = req.params.id;
  // Check id not found
  let post = await Post.findByPk(id);
  if (!post) {
    res.sendStatus(404);
    return;
  }
  let num = await Post.destroy({
    // destroy() deletes data based on the where condition, and returns the number of rows affected
    where: { id: id },
  });
  if (num == 1) {
    // destry() returns no. of rows affected, that's why if num == 1
    res.json({
      message: "Post was deleted successfully.",
    });
  } else {
    res.status(400).json({
      message: `Cannot delete post with id ${id}.`,
    });
  }
});

router.post("/:id/comments", async (req, res) => {
  let data = req.body;

  // Validate request body
  let validationSchema = yup.object({
    content: yup.string().trim().min(3).max(500).required(),
    userId: yup.string().required(),
    postId: yup.string().required(),
  });

  try {
    console.log("Validating schema...");
    data = await validationSchema.validate(data, { abortEarly: false });

    console.log("Creating comment...");
    let result = await Comment.create(data);

    res.json(result);
    console.log("Success!");
  } catch (err) {
    console.log("Error caught! Info: " + err);
    res.status(400).json({ errors: err.errors });
  }
});

router.get("/:id/getComments", async (req, res) => {
  let id = req.params.id;

  let condition = {
    where: { postId: id },
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName"], // Specify the attributes you need
      },
    ],
    order: [["createdAt", "DESC"]],
  };

  // Check id not found
  let comments = await Comment.findAll(condition);
  if (!comments) {
    res.sendStatus(404);
    return;
  }
  res.json(comments);
});

module.exports = router;
