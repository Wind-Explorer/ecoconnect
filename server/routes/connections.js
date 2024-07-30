const express = require("express");
const { openAiChatCompletion } = require("../connections/openai");
const { validateToken } = require("../middlewares/auth");
const router = express.Router();

router.get(
  "/openai-chat-completion/:query",
  validateToken,
  async (req, res) => {
    let data = req.params.query;
    console.log(data);
    try {
      let chatResponse = await openAiChatCompletion(data);
      res.json({ response: chatResponse });
    } catch (error) {
      console.error("Error with AI:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

module.exports = router;
