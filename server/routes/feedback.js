const express = require("express");
const router = express.Router();
const yup = require("yup");
const { validateToken } = require("../middlewares/auth");
const { Feedback } = require("../models");

let validationSchema = yup.object({
  userId: yup.string().trim().min(36).max(36).required(),
  feedbackCategory: yup.number().min(0).max(2).required(),
  allowContact: yup.boolean().required(),
  subject: yup.string().trim().min(1).max(100).required(),
  comment: yup.string().trim().min(1).max(2048).required(),
});

router.get("/all", validateToken, async (req, res) => {
  let condition = {};
  let search = req.query.search;
  if (search) {
    condition[Op.or] = [
      { type: { [Op.like]: `%${search}%` } },
      { comment: { [Op.like]: `%${search}%` } },
    ];
  }

  let list = await Feedback.findAll({
    where: condition,
    order: [["createdAt", "DESC"]],
  });
  res.json(list);
});

router.get("/:id", validateToken, async (req, res) => {
  let id = req.params.id;
  let feedback = await Feedback.findByPk(id);

  if (!feedback) {
    res.sendStatus(404);
    return;
  }

  res.json(feedback);
});

router.post("/", validateToken, async (req, res) => {
  let data = req.body;

  try {
    console.log("Validating schema...");
    data = await validationSchema.validate(data, { abortEarly: false });

    let result = await Feedback.create(data);
    res.json(result);
  } catch (err) {
    console.log("Error caught! Info: " + err);
    res.status(400).json({ errors: err.errors });
  }
});

router.delete("/:id", validateToken, async (req, res) => {
  let id = req.params.id;

  try {
    let result = await Feedback.destroy({ where: { id } });

    if (result === 0) {
      res.sendStatus(404);
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    console.log("Error caught! Info: " + err);
    res.status(500).json({ error: "An error occurred while deleting the feedback." });
  }
});

module.exports = router;