const express = require("express");
const {
  openAiChatCompletion,
  openAiHomeBillVerification,
} = require("../connections/openai");
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

async function resolveBillPayableAmount(base64Data) {
  return await openAiHomeBillVerification(base64Data);
}

let base64Chunks = [];

router.post(
  "/resolve-home-bill-payable-amount",
  validateToken,
  async (req, res) => {
    const { chunk, chunkIndex, totalChunks } = req.body;

    // 存储接收到的块
    base64Chunks[chunkIndex] = chunk;

    // 检查是否接收到所有块
    if (base64Chunks.length === parseInt(totalChunks)) {
      const completeBase64String = base64Chunks.join("");
      base64Chunks = []; // 清空数组以便下次上传使用

      try {
        console.log("starting actual resolve");
        let verificationResponse = await resolveBillPayableAmount(
          completeBase64String
        );
        res.json({ response: verificationResponse });
      } catch (error) {
        console.error("Error with AI:", error);
        res.status(500).json({ message: "Internal Server Error: " + error });
      }
    } else {
      res.status(200).json({ message: "Chunk received" });
    }
  }
);

module.exports = router;
