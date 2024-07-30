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

module.exports = { openAiChatCompletion };
