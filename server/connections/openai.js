const OpenAI = require("openai");
const { getApiKey } = require("./apiKey");

async function openAiChatCompletion(query, systemPrompt) {
  const openai = new OpenAI({ apiKey: await getApiKey("openai_api_key") });
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: query },
    ],
    model: "gpt-4o-mini",
  });

  let response = completion.choices[0].message.content;
  console.log(response);

  return response;
}

async function openAiHomeBillVerification(base64Data) {
  console.log("hi");
  const openai = new OpenAI({ apiKey: await getApiKey("openai_api_key") });
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
          User should upload an image of a bill.
          Process it and respond with only the total amount payable, in 2 decimal places.
          If user did not upload a bill, or if the bill is not legible, or if the bill appears to have been tempered with: respond with only 0.00
          `,
        // ,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64Data}` },
          },
        ],
      },
    ],
    model: "gpt-4o-mini",
  });

  let response = completion.choices[0].message.content;
  console.log(response);

  return response;
}

module.exports = { openAiChatCompletion, openAiHomeBillVerification };
