const express = require("express");
const router = express.Router();
const { Events } = require("../models");
const multer = require("multer");
const { Op } = require("sequelize");
const path = require("path");
const yup = require("yup");
const sharp = require("sharp");
const { validateToken } = require("../middlewares/auth");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", async (req, res) => {
  try {
    const { category, townCouncil, time} = req.query;

    console.log("Filter Parameters:", { category, townCouncil, time });

    const timeToCategory = (time) => {
      if (!time) return null;
      const hour = new Date(time).getHours();
      if (hour < 12) return "Morning";
      if (hour < 18) return "Afternoon";
      return "Evening";
    };

    const timeCategory = timeToCategory(time);

    let filter = {
      slotsAvailable: { [Op.gt]: 0 }
    };
    if (category) filter.category = category;
    if (townCouncil) filter.townCouncil = townCouncil;
    if (timeCategory) filter.timeCategory = timeCategory;

    console.log("Constructed Filter Object:", filter);

    const filteredEvents = await Events.findAll({
      attributes: { exclude: ["evtPicture"] },
      where: filter,
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

router.put(
  "/event-image/:id",
  validateToken,
  upload.single("image"),
  async (req, res) => {
    const id = req.params.id;

    // Check if user exists
    const user = await Events.findByPk(id);
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
        .resize({ width: 1024, height: 1024, fit: sharp.fit.cover }) // Adjust size as necessary
        .toBuffer();

      // Update user's profile picture
      await Events.update(
        { evtPicture: croppedBuffer },
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

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  let data = req.body;

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

     // Check if there are available slots
     if (event.slotsAvailable <= 0) {
      return res.status(400).json({ message: "No available slots for this event" });
    }

    // Decrease the number of available slots
    await Events.update(
      { slotsAvailable: event.slotsAvailable - 1 },
      { where: { id: id } }
    );

    res.json({ message: "Registration successful" });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(400).json({ errors: err.errors });
    res.status(500).json({ message: "Error during registration", error: err.message });
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
