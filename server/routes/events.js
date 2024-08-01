const express = require('express');
const router = express.Router();
const { Events } = require('../models');
const multer = require('multer');
const { Op } = require("sequelize");
const path = require('path');
const yup = require('yup');
const sharp = require("sharp");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.fields([
    { name: 'evtPicture', maxCount: 1 },
]), async (req, res) => {

    let data = req.body;
    let files = req.files;// Log incoming data
    
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

        // Process valid data
        let evtPicture = files.evtPicture[0].buffer;

        let result = await Events.create({ ...data, evtPicture });

        res.json(result);
    } catch (err) {
        console.error("Validation error:", err); // Log the validation error
        res.status(400).json({ errors: err.errors });
    }
});
  
  router.get("/", async (req, res) => {
    try {
      let list = await Events.findAll({
        order: [['createdAt', 'DESC']],
      });
      res.json(list);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
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

router.get("/evtPicture/:id", async (req, res) => {
    let id = req.params.id;
    let events = await Events.findByPk(id);

    if (!events || !events.evtPicture) {
        res.sendStatus(404);
        return;
    }

    try {
        res.set("Content-Type", "image/jpeg"); 
        res.send(events.evtPicture);
    } catch (err) {
        res
            .status(500)
            .json({ message: "Error retrieving image", error: err });
    }
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
        imageUrl: yup.string(),
        slotsAvailable: yup.number().integer(),
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
