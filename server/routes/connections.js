const express = require("express");
const axios = require("axios");
const { sendPasswordResetEmail } = require("../connections/mailersend");
const { User } = require("../models");

const router = express.Router();

router.put("/send-reset-password-email/:id", async (req, res) => {
  let id = req.params.id;

  try {
    console.log(id);
    let user = await User.findByPk(id);

    if (!user) {
      res.sendStatus(404);
      return;
    }

    if (user.isArchived) {
      res.status(400).json({
        message: `ERR_ACC_IS_ARCHIVED`,
      });
    } else {
      await sendPasswordResetEmail(user.email, user.firstName);

      res.status(200).json({ message: "Email sent successfully" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to send email", message: error.message });
  }
});

module.exports = router;
