const express = require("express");
const router = express.Router();
const { Post, Comment, User, Tag, PostTag } = require("../models");
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
    let tags = req.body.tags ? JSON.parse(req.body.tags) : [];

    // Validate request body
    let validationSchema = yup.object({
      title: yup.string().trim().min(3).max(200).required(),
      content: yup.string().trim().min(3).max(3000).required(),
      userId: yup.string().required(),
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

      // Handle tags
      for (let tagName of tags) {
        let [tag, created] = await Tag.findOrCreate({
          where: { tag: tagName },
        });
        await result.addTag(tag); // Associate the tag with the post
      }

      res.json(result);
    } catch (err) {
      res.status(400).json({ errors: err.errors });
    }
  }
);

router.get("/", async (req, res) => {
  let condition = {
    where: {},
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Tag,
        through: { attributes: [] }, // Exclude attributes from the join table
        attributes: ["id", "tag"], // Fetch only 'id' and 'tag' attributes
      },
    ],
  };

  let search = req.query.search;
  let tag = req.query.tag;

  if (search) {
    condition.where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { content: { [Op.like]: `%${search}%` } },
    ];
  }

  if (tag) {
    condition.include[0].where = { tag: tag };
  }

  // You can add condition for other columns here
  // e.g. condition.columnName = value;

  let list = await Post.findAll(condition);
  res.json(list);
});

router.get("/:id", async (req, res) => {
  let id = req.params.id;
  let post = await Post.findByPk(id, {
    include: [
      {
        model: Tag,
        through: { attributes: [] }, // Exclude attributes from the join table
        attributes: ["id", "tag"], // Fetch only 'id' and 'tag' attributes
      },
    ],
  });

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
    let data = req.body;
    let tags = req.body.tags ? JSON.parse(req.body.tags) : [];

    // Check id not found
    let post = await Post.findByPk(id);
    if (!post) {
      res.sendStatus(404);
      return;
    }

    // Validate request body
    let validationSchema = yup.object({
      title: yup.string().trim().min(3).max(200).required(),
      content: yup.string().trim().min(3).max(3000).required(),
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

      let postImage = files.postImage ? files.postImage[0].buffer : null;
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

      // Update post data
      await post.update(data);

      // Clear existing tags
      await post.setTags([]);

      // Handle tags
      for (let tagName of tags) {
        let [tag, created] = await Tag.findOrCreate({
          where: { tag: tagName },
        });
        await post.addTag(tag); // Associate the tag with the post
      }

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
    // destroy() returns no. of rows affected, that's why if num == 1
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
    content: yup.string().trim().min(3).max(3000).required(),
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

router.put("/comments/:id", async (req, res) => {
  let { id } = req.params;
  let data = req.body;

  // Validate request body
  let validationSchema = yup.object({
    content: yup.string().trim().min(3).max(3000).required(),
    userId: yup.string().required(),
    postId: yup.string().required(),
  });
  try {
    console.log("Validating schema...");
    data = await validationSchema.validate(data, { abortEarly: false });

    // Ensure comment exists
    let comment = await Comment.findByPk(id);
    if (!comment) {
      res.sendStatus(404); // Comment not found
      return;
    }

    let result = await comment.update(data);
    res.json({ message: "Comment updated successfully", comment });
  } catch (err) {
    res.status(400).json({ errors: err.errors });
  }
})

router.get("/:id/getComments", async (req, res) => {
  let id = req.params.id;

  let condition = {
    where: { postId: id },
    include: [
      {
        model: User,
        as: "user",
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

router.delete("/comments/:id", async (req, res) => {
  let id = req.params.id;
  console.log("Deleting comment with ID: ", id)
  // Check id not found
  let comment = await Comment.findByPk(id);
  if (!comment) {
    res.sendStatus(404);
    return;
  }
  let num = await Comment.destroy({
    // destroy() deletes data based on the where condition, and returns the number of rows affected
    where: { id: id },
  });
  if (num == 1) {
    // destroy() returns no. of rows affected, that's why if num == 1
    res.json({
      message: "Comment was deleted successfully.",
    });
  } else {
    res.status(400).json({
      message: `Cannot delete comment with id ${id}.`,
    });
  }
});

router.get("/tags/all", async (req, res) => {
  // Check id not found
  let tags = await Tag.findAll();
  if (!tags) {
    res.sendStatus(404);
    return;
  }
  res.json(tags);
})

router.delete("/tags/:id", async (req, res) => {
  let id = req.params.id;
  // Check id not found
  let tag = await Tag.findByPk(id);
  if (!tag) {
    res.sendStatus(404);
    return;
  }
  let num = await Tag.destroy({
    // destroy() deletes data based on the where condition, and returns the number of rows affected
    where: { id: id },
  });

  if (num == 1) {
    // destroy() returns no. of rows affected, that's why if num == 1
    res.json({
      message: "Tag was deleted successfully.",
    });
  } else {
    res.status(400).json({
      message: `Cannot delete tag with id ${id}.`,
    });
  }
})

module.exports = router;
