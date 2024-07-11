const express = require('express');
const router = express.Router();
const { Events } = require('../models');
const multer = require('multer');
const path = require('path');
const yup = require('yup');

router.post("/", async (req, res) => {
    let data = req.body;
    console.log("Incoming data:", data); // Log incoming data
    const validationSchema = yup.object({
        title: yup.string().trim().min(3).max(100).required(),
        description: yup.string().trim().min(3).max(500).required(),
        date: yup.date().required(),
        time: yup.string().required(),
        location: yup.string().required(),
        category: yup.string().required(),
        imageUrl: yup.string().matches(/(\/uploads\/.+)/, 'Image URL must be a valid path').required(),
        slotsAvailable: yup.number().integer().required()
    });

    try {
        data = await validationSchema.validate(data, { abortEarly: false });
        console.log("Validated data:", data); // Log validated data
        const result = await Events.create(data);
        console.log("Event created:", result); // Log successful creation
        res.json(result);
    } catch (err) {
        console.error("Validation error:", err); // Log the validation error
        res.status(400).json({ errors: err.errors });
    }
});

const upload = multer({ storage: multer.memoryStorage() });

router.put(
    "/:id",
    upload.single("image"),
    async (req, res) => {
      const id = req.params.id;
  
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
  
        await User.update(
          { Events: croppedBuffer },
          { where: { id: id } }
        );
  
        res.json({ message: "Event image successfully uploaded." });
      } catch (err) {
        res
          .status(500)
          .json({ message: "Internal server error", errors: err.errors });
      }
    }
  );
  

router.get("/", async (req, res) => {
    const list = await Events.findAll({
        order: [['createdAt', 'DESC']],
    });
    res.json(list);
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const event = await Events.findByPk(id);
    if (!event) {
        res.sendStatus(404);
        return;
    }
    res.json(event);
});

router.put("/:id", async (req, res) => {
    const id = req.params.id;
    let data = req.body;
    const validationSchema = yup.object({
        title: yup.string().trim().min(3).max(100),
        description: yup.string().trim().min(3).max(500),
        date: yup.date(),
        time: yup.string(),
        location: yup.string(),
        category: yup.string(),
        imageUrl: yup.string().matches(/(\/uploads\/.+)/, 'Image URL must be a valid path'),
        slotsAvailable: yup.number().integer()
    });

    try {
        data = await validationSchema.validate(data, { abortEarly: false });
        const event = await Events.findByPk(id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        await Events.update(data, { where: { id: id } });
        res.json({ message: "Event updated successfully" });
    } catch (err) {
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
