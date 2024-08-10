const express = require('express');
const router = express.Router();
const { Voucher } = require('../models');
const { Op } = require("sequelize");
const yup = require("yup");
const multer = require("multer");
const sharp = require("sharp");

const upload = multer({ storage: multer.memoryStorage() });

router.post(
    "/",
    upload.fields([{ name: "brandLogo", maxCount: 1 }]),
    async (req, res) => {
        let data = req.body;
        let files = req.files;

        // Validate request body
        let validationSchema = yup.object().shape({
            brand: yup.string().trim().max(100).required(),
            description: yup.string().trim().required(),
            expirationDate: yup.date().required(),
            quantityAvailable: yup.number().min(0).positive().required(),
            code: yup.string().trim().required(),
            brandLogo: yup.string().trim().max(255), // Optional field
        });

        try {
            data = await validationSchema.validate(data, { abortEarly: false });

            // Process brandLogo if it exists
            let brandLogo = files.brandLogo ? files.brandLogo[0].buffer : null;

            if (brandLogo) {
                // Resize and compress image
                brandLogo = await sharp(brandLogo)
                    .resize(512, 512, {
                        fit: sharp.fit.inside,
                        withoutEnlargement: true,
                    })
                    .jpeg({ quality: 80 })
                    .toBuffer();
            }

            // Include brandLogo in data if processed
            let result = await Voucher.create({ ...data, brandLogo });
            res.json(result);
        } catch (err) {
            res.status(400).json({ errors: err.errors });
        }
    }
);


router.get("/", async (req, res) => {
    let condition = {};
    let search = req.query.search;
    if (search) {
        condition[Op.or] = [
            { brand: { [Op.like]: `%${search}%` } },
        ];
    }
    let list = await Voucher.findAll({
        where: condition,
        order: [["createdAt", "ASC"]]
    });
    res.json(list);
});

router.get("/:id", async (req, res) => {
    let id = req.params.id;
    let vouchers = await Voucher.findByPk(id);
    if (!vouchers) {
        res.sendStatus(404);
        return;
    }
    res.json(vouchers);
});

router.get("/brandLogo/:id", async (req, res) => {
    let id = req.params.id;
    let vouchers = await Voucher.findByPk(id);

    if (!vouchers || !vouchers.brandLogo) {
        res.sendStatus(404);
        return;
    }

    try {
        res.set("Content-Type", "image/jpeg"); // Adjust the content type as necessary
        res.send(vouchers.brandLogo);
    } catch (err) {
        res
            .status(500)
            .json({ message: "Error retrieving brand", error: err });
    }
});

router.put("/:id", async (req, res) => { //update
    let id = req.params.id;
    let vouchers = await Voucher.findByPk(id);
    if (!vouchers) {
        res.sendStatus(404);
        return;
    }
    let data = req.body;
    let validationSchema = yup.object().shape({
        brand: yup.string().trim().max(100).required(),
        description: yup.string().trim().required(),
        expirationDate: yup.date().required(),
        quantityAvailable: yup.number().min(0).positive().required(),
        code: yup.string().trim().required(),
    });
    try {
        data = await validationSchema.validate(data,
            { abortEarly: false });
        let num = await Voucher.update(data, {
            where: { id: id }
        });
        if (num == 1) {
            res.json({
                message: "Voucher was updated successfully."
            });
        }
        else {
            res.status(400).json({
                message: `Cannot update voucher with id ${id}.`
            });
        }
    }
    catch (err) {
        res.status(400).json({ errors: err.errors });
    }
});

router.delete("/:id", async (req, res) => {
    let id = req.params.id;
    let num = await Voucher.destroy({
        where: { id: id }
    })
    if (num == 1) {
        res.json({
            message: "Voucher was deleted successfully."
        });
    }
    else {
        res.status(400).json({
            message: `Cannot delete voucher with id ${id}.`
        });
    }
});


module.exports = router;