const express = require("express");
const router = express.Router();
const { HBCform } = require("../models");
const { Op } = require("sequelize");
const yup = require("yup");
const multer = require("multer");
const sharp = require("sharp");
const { sendThankYouEmail } = require("../connections/mailersend");
const upload = multer({ storage: multer.memoryStorage() });

async function processFile(file) {
    try {
        const { buffer, mimetype } = file;
        const maxSize = 5 * 1024 * 1024; // 5MB limit for compressed image size
        let processedBuffer;

        if (mimetype.startsWith("image/")) {
            // Handle image files
            const metadata = await sharp(buffer).metadata();

            // Compress the image based on its format
            if (metadata.format === "jpeg") {
                processedBuffer = await sharp(buffer)
                    .jpeg({ quality: 80 }) // Compress to JPEG
                    .toBuffer();
            } else if (metadata.format === "png") {
                processedBuffer = await sharp(buffer)
                    .png({ quality: 80 }) // Compress to PNG
                    .toBuffer();
            } else if (metadata.format === "webp") {
                processedBuffer = await sharp(buffer)
                    .webp({ quality: 80 }) // Compress to WebP
                    .toBuffer();
            } else {
                // For other image formats (e.g., TIFF), convert to JPEG
                processedBuffer = await sharp(buffer)
                    .toFormat("jpeg")
                    .jpeg({ quality: 80 })
                    .toBuffer();
            }

            // Check the size of the compressed image
            if (processedBuffer.length > maxSize) {
                throw new Error(`Compressed file too large: ${(processedBuffer.length / 1000000).toFixed(2)}MB`);
            }
        } else if (mimetype === "application/pdf") {
            // Handle PDF files
            console.log("Processing PDF");
            processedBuffer = buffer; // Store the PDF as is
            // Optionally, process PDF using pdf-lib or other libraries
        } else {
            throw new Error(`Unsupported file type: ${mimetype}`);
        }

        return processedBuffer;
    } catch (err) {
        console.error("Error processing file:", err);
        throw err;
    }
}

router.post(
    "/",
    upload.fields([
        { name: "ebPicture", maxCount: 1 },
        { name: "wbPicture", maxCount: 1 },
    ]),
    async (req, res) => {
        let data = req.body;
        let files = req.files;

        // Validate request body
        let validationSchema = yup.object({
            electricalBill: yup.number().positive().required(),
            waterBill: yup.number().positive().required(),
            totalBill: yup.number().positive().required(),
            noOfDependents: yup.number().integer().positive().required(),
            avgBill: yup.number().positive().required(),
        });

        try {

            data = await validationSchema.validate(data, { abortEarly: false });

            // Process the files
            const processedEbPicture = await processFile(files.ebPicture[0]);
            const processedWbPicture = await processFile(files.wbPicture[0]);

            // Save the form with processed files
            let result = await HBCform.create({
                ...data,
                ebPicture: processedEbPicture,
                wbPicture: processedWbPicture,
            });

            res.json(result);
        } catch (err) {
            console.error('Error processing request:', err);
            res.status(400).json({ message: 'Bad request', errors: err.errors || err.message });
        }
    }
);

router.get("/", async (req, res) => {
    let condition = {};
    let search = req.query.search;
    if (search) {
        condition[Op.or] = [
            { electricalBill: { [Op.like]: `%${search}%` } },
            { waterBill: { [Op.like]: `%${search}%` } },
            { totalBill: { [Op.like]: `%${search}%` } },
            { noOfDependents: { [Op.like]: `%${search}%` } },
            { avgBill: { [Op.like]: `%${search}%` } },
        ];
    }
    let list = await HBCform.findAll({
        where: condition,
        order: [["createdAt", "ASC"]]
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

router.delete("/:id", async (req, res) => {
    let id = req.params.id;
    try {
        const result = await HBCform.destroy({ where: { id } });
        if (result === 0) {
            // No rows were deleted
            res.sendStatus(404);
        } else {
            // Successfully deleted
            res.sendStatus(204);
        }
    } catch (err) {
        console.error("Error deleting form entry:", err);
        res.status(500).json({ message: "Failed to delete form entry", error: err });
    }
});

// Endpoint for sending emails related to home bill contest
router.post("/send-homebill-contest-email", async (req, res) => {
    const { email, name } = req.body;
    try {
        await sendThankYouEmail(email, name);
        res.status(200).send({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Failed to send email:", error);
        res.status(500).send({ error: "Failed to send email" });
    }
});

router.get("/has-handed-in-form/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        const form = await HBCform.findOne({ where: { userId } });
        if (form) {
            res.json({ hasHandedInForm: true, formId: form.id });
        } else {
            res.json({ hasHandedInForm: false });
        }
    } catch (err) {
        console.error("Error checking if user has handed in form:", err);
        res.status(500).json({ message: "Failed to check if user has handed in form", error: err });
    }
});

module.exports = router;