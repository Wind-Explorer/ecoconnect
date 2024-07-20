const express = require('express');
const router = express.Router();
const { HBCform } = require('../models');
const { Op } = require("sequelize");
const yup = require("yup");
const multer = require("multer");
const sharp = require("sharp");


const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.fields([
    { name: 'ebPicture', maxCount: 1 },
    { name: 'wbPicture', maxCount: 1 }
]), async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);

    let data = req.body;
    let files = req.files;

    // Validate request body
    let validationSchema = yup.object({
        electricalBill: yup.number().positive().required(),
        waterBill: yup.number().positive().required(),
        totalBill: yup.number().positive().required(),
        noOfDependents: yup.number().integer().positive().required(),
    });
    try {
        data = await validationSchema.validate(data, { abortEarly: false });
        console.log("Validated data:", data);

        // Process valid data
        let ebPicture = files.ebPicture[0].buffer;
        let wbPicture = files.wbPicture[0].buffer;

        let result = await HBCform.create({ ...data, ebPicture, wbPicture });
        res.json(result);
    } catch (err) {
        console.error("Error:", err);
        res.status(400).json({ errors: err.errors });
    }
});

router.get("/", async (req, res) => {
    let condition = {};
    let search = req.query.search;
    if (search) {
        condition[Op.or] = [
            { electricalBill: { [Op.like]: `%${search}%` } },
            { waterBill: { [Op.like]: `%${search}%` } },
            { totalBill: { [Op.like]: `%${search}%` } },
            { noOfDependents: { [Op.like]: `%${search}%` } },
        ];
    }
    let list = await HBCform.findAll({
        where: condition,
        order: [['createdAt', 'ASC']]
    });
    res.json(list);
});

router.get("/:id", async (req, res) => {
    let id = req.params.id;
    let hbcform = await HBCform.findByPk(id);
    if (!hbcform) {
        res.sendStatus(404);
        return;
    }
    res.json(hbcform);
});

router.get("/ebPicture/:id", async (req, res) => {
    let id = req.params.id;
    let hbcform = await HBCform.findByPk(id);

    if (!hbcform || !hbcform.ebPicture) {
        res.sendStatus(404);
        return;
    }

    try {
        res.set("Content-Type", "image/jpeg"); // Adjust the content type as necessary
        res.send(hbcform.ebPicture);
    } catch (err) {
        res
            .status(500)
            .json({ message: "Error retrieving electrical bill", error: err });
    }
});

router.get("/wbPicture/:id", async (req, res) => {
    let id = req.params.id;
    let hbcform = await HBCform.findByPk(id);

    if (!hbcform || !hbcform.wbPicture) {
        res.sendStatus(404);
        return;
    }

    try {
        res.set("Content-Type", "image/jpeg"); // Adjust the content type as necessary
        res.send(hbcform.wbPicture);
    } catch (err) {
        res
            .status(500)
            .json({ message: "Error retrieving electrical bill", error: err });
    }
});

module.exports = router;