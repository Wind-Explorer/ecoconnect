const express = require("express");
const { openAiChatCompletion } = require("../connections/openai");
const { validateToken } = require("../middlewares/auth");
const router = express.Router();

const nlsPrompt = `
"/": home
"/springboard": user dashboard
"/manage-account": manage user account
"/events": events
"/karang-guni-schedules": browse karang guni slots
"/home-bill-contest": participate in contest & earn vouchers
"/home-bill-contest/new-submission": submit bill
"/community-posts": show posts
"/community-posts/create": create post

based on input, provide appropriate route closest to fulfilling user's needs
If none matches user query, return empty route, however try your best not to.
in following format:

{"route": "<appropriate route>"}
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
