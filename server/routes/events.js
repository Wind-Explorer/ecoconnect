const express = require("express");
const router = express.Router();
const { Events } = require("../models");
const multer = require("multer");
const { Op } = require("sequelize");
const path = require("path");
const yup = require("yup");
const sharp = require("sharp");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", async (req, res) => {
  try {
    const { category, townCouncil, time } = req.query;

    console.log("Filter Parameters:", { category, townCouncil, time });

    const timeToCategory = (time) => {
      if (!time) return null;
      const hour = new Date(time).getHours();
      if (hour < 12) return "Morning";
      if (hour < 18) return "Afternoon";
      return "Evening";
    };

    const timeCategory = timeToCategory(time);

    let filter = {};
    if (category) filter.category = category;
    if (townCouncil) filter.townCouncil = townCouncil;
    if (timeCategory) filter.timeCategory = timeCategory;

    console.log("Constructed Filter Object:", filter);

    const filteredEvents = await Events.findAll({
      attributes: { exclude: ["evtPicture"] },
      where: {
        [Op.and]: [
          category ? { category } : {},
          townCouncil ? { townCouncil } : {},
          timeCategory ? { timeCategory } : {},
        ],
      },
    });

    res.json(filteredEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post(
  "/",
  upload.fields([{ name: "evtPicture", maxCount: 1 }]),
  async (req, res) => {
    let data = req.body;
    let files = req.files;

    let validationSchema = yup.object({
      title: yup.string().trim().min(3).max(100).required(),
      description: yup.string().trim().min(3).max(500).required(),
      date: yup.date().required(),
      time: yup.string().required(),
      location: yup.string().required(),
      category: yup.string().required(),
      slotsAvailable: yup.number().integer().required(),
    });

    try {
      data = await validationSchema.validate(data, { abortEarly: false });

      let evtPicture = files.evtPicture ? files.evtPicture[0].buffer : null;

      if (evtPicture) {
        evtPicture = await sharp(evtPicture).resize(800, 600).jpeg().toBuffer();
      }

      let result = await Events.create({ ...data, evtPicture });

      res.json(result);
    } catch (err) {
      console.error("Validation error:", err);
      res.status(400).json({ errors: err.errors });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    let list = await Events.findAll({
      attributes: { exclude: ["evtPicture"] },
      order: [["createdAt", "DESC"]],
    });

    res.json(list);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const event = await Events.findByPk(id, {
    attributes: { exclude: [] }, // Exclude evtPicture only if you don't want to include it
  });
  if (!event) {
    res.sendStatus(404);
    return;
  }
  res.json(event);
});

router.get("/evtPicture/:id", async (req, res) => {
  let id = req.params.id;
  try {
    let events = await Events.findByPk(id);

    if (!events || !events.evtPicture) {
      res.sendStatus(404);
      return;
    }

    res.set("Content-Type", "image/jpeg");
    res.send(events.evtPicture);
  } catch (err) {
    console.error("Error retrieving image:", err);
    res.status(500).json({ message: "Error retrieving image", error: err });
  }
});

router.put("/:id", upload.fields([{ name: "evtPicture", maxCount: 1 }]), async (req, res) => {
  const id = req.params.id;
  let data = req.body;
  let files = req.files;

  console.log("Received PUT request to update event with ID:", id);
  console.log("Data received for update:", data);

  const validationSchema = yup.object({
    title: yup.string().trim().min(3).max(100),
    description: yup.string().trim().min(3).max(500),
    date: yup.date(),
    time: yup.string(),
    location: yup.string(),
    category: yup.string(),
    slotsAvailable: yup.number().integer(),
  });

  try {
    data = await validationSchema.validate(data, { abortEarly: false });
    console.log("Data after validation:", data);

    const event = await Events.findByPk(id);
    if (!event) {
      console.log("Event not found with ID:", id);
      return res.status(404).json({ message: "Event not found" });
    }

    let evtPicture = files.evtPicture ? files.evtPicture[0].buffer : null;

    if (evtPicture) {
      evtPicture = await sharp(evtPicture).resize(800, 600).jpeg().toBuffer();
      data.evtPicture = evtPicture; // Add the processed image to the update data
    }

    await Events.update(data, { where: { id: id } });
    console.log("Event updated successfully with ID:", id);

    res.json({ message: "Event updated successfully" });
  } catch (err) {
    console.error("Error during event update:", err);
    res.status(400).json({ errors: err.errors });
  }
});

router.post("/register/:id", async (req, res) => {
  const id = req.params.id;
  let data = req.body;

  // Assuming you're associating registration data with an event
  try {
    const event = await Events.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Process registration data (e.g., save to a Registration table or similar)
    // Here we assume that you might just be updating the event for simplicity
    // Modify this logic as needed based on your actual requirements
    await Events.update(data, { where: { id: id } });

    res.json({ message: "Registration successful" });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(400).json({ errors: err.errors });
  }
});


router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const event = await Events.findByPk(id);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }
  await Events.destroy({ where: { id: id } });
  res.json({ message: "Event deleted successfully" });
});

module.exports = router;
