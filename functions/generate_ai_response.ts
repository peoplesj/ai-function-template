import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import OpenAI from "openai/mod.ts";

export const GenerateAIResponse = DefineFunction({
  callback_id: "ai_response",
  title: "generate an AI response to the context data.",
  description: "save the AI response as an output variable",
  source_file: "functions/generate_ai_response.ts",
  input_parameters: {
    properties: {
      context: {
        type: Schema.types.string,
        description: "Add a variable as the context information",
      },
      custom_prompt: {
        type: Schema.slack.types.expanded_rich_text,
        description: "AI prompt",
      },
    },
    required: ["context", "custom_prompt"],
  },
  output_parameters: {
    properties: {
      ai_response: {
        type: Schema.types.string,
        description: "The output of the ai response",
      },
    },
    required: ["ai_response"],
  },
});

export default SlackFunction(
  GenerateAIResponse,
  async ({ inputs, env }) => {
    const context = inputs.context;
    let AIResponse = "";
    let OPEN_AI;
    let customPrompt = inputs.custom_prompt;
    customPrompt = customPrompt[0].elements[0].elements[0].text; // extract the prompt text from the rich text object

    try {
      OPEN_AI = new OpenAI({
        apiKey: env.OPEN_AI_KEY,
      });
    } catch (error) {
      console.error("OPEN AI API key error:", error);
    }

    try {
      //  Make the API call to Open AI with the user provided context
      const chatCompletion = await OPEN_AI!.chat.completions.create({
        messages: [
          {
            "role": "system",
            "content": customPrompt,
          },
          { "role": "user", "content": `${context}` },
        ],
        model: "gpt-3.5-turbo",
      });
      AIResponse = chatCompletion.choices[0].message.content ?? "undefined";
      console.log("Successful AI response", AIResponse);
    } catch (error) {
      console.error("Error with OPEN_AI!.chat.completions.create: ", error);
    }

    // Specifying these variables as output will allow them to be used by the next step in the workflow
    return {
      outputs: {
        ai_response: AIResponse,
      },
    };
  },
);
