const express = require("express");
const { openAiChatCompletion } = require("../connections/openai");
const { validateToken } = require("../middlewares/auth");
const router = express.Router();

const nlsPrompt = `
You are an AI designed to help navigate a website by interpreting natural language inputs and providing the correct site route. Below are routes and a brief description of each:

"/" : home
"/springboard" : user dashboard
"/manage-account" : user account management
"/events" : events
"/karang-guni-schedules" : browse slots
"/home-bill-contest" : participate in contest & earn vouchers
"/home-bill-contest/new-submission" : submit bill
"/community-posts" : show posts
"/community-posts/create" : create post

based on input, provide appropriate route in following format:

{
  "route": "<appropriate route>",
}

If none matches user query, return empty route.
`;

async function naturalLanguageSearch(userQuery) {
  return await openAiChatCompletion(userQuery, nlsPrompt);
}

router.get("/nls/:query", validateToken, async (req, res) => {
  let data = req.params.query;
  console.log(data);
  try {
    let chatResponse = await naturalLanguageSearch(data);
    res.json({ response: chatResponse });
  } catch (error) {
    console.error("Error with AI:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
