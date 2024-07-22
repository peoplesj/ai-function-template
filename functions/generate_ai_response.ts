import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import OpenAI from "openai/mod.ts";

export const GenerateAIResponse = DefineFunction({
  callback_id: "ai_response",
  title: "generate a summary of an incident",
  description: "save the incident summary and title as output variables",
  source_file: "functions/ai_incident_response.ts",
  input_parameters: {
    properties: {
      ai_key: {
        type: Schema.types.string,
        description: "Open AI API Key Example: SK-proj....",
        hint: "Create a new Open AI API key here: platform.openai.com/api-keys",
      },
      custom_prompt: {
        type: Schema.slack.types.expanded_rich_text,
        description: "AI prompt",
      },
      context: {
        type: Schema.types.string,
        description: "Add a variable as the context information",
      },
    },
    required: ["ai_key", "custom_prompt", "context"],
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
  async ({ inputs }) => {
    const context = inputs.context;
    let AIResponse = "";
    let OPEN_AI;
    let customPrompt = inputs.custom_prompt;
    customPrompt = customPrompt[0].elements[0].elements[0].text; // extract the prompt text from the rich text object

    try {
      OPEN_AI = new OpenAI({
        apiKey: inputs.ai_key,
      });
    } catch (error) {
      console.error("OPEN AI API key error:", error);
    }

    try {
      //  Make the API call to Open AI with the
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
