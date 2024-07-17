import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import OpenAI from "openai/mod.ts";

export const GenerateAIResponse = DefineFunction({
  callback_id: "ai_incident_response",
  title: "generate a summary of an incident",
  description: "save the incident summary and title as output variables",
  source_file: "functions/ai_incident_response.ts",
  input_parameters: {
    properties: {
      ai_token: {
        type: Schema.types.string,
        description: "Channel ID, display option example: 'C123' ",
      },
      custom_prompt: {
        type: Schema.types.string,
        description: "Channel ID, display option example: 'C123' ",
      },
      context: {
        type: Schema.types.string,
        description: "Channel ID, display option example: 'C123' ",
      },
    },
    required: [],
  },
  output_parameters: {
    properties: {
      ai_incident_response: {
        type: Schema.types.string,
        description: "An ai summary of the incident",
      },
    },
    required: ["ai_incident_response"],
  },
});

export default SlackFunction(
  GenerateAIResponse,
  async ({ inputs }) => {
    let AIResponse = "";
    const context = inputs.context as string;
    const customPrompt = inputs.custom_prompt as string;

    try {
      const OPEN_AI = new OpenAI({
        apiKey: inputs.ai_token,
      });

      //  Make the API call to Open AI with the hard coded prompt and the original message.
      const chatCompletion = await OPEN_AI.chat.completions.create({
        messages: [
          {
            "role": "system",
            "content": customPrompt,
          },
          { "role": "user", "content": `${context}` },
        ],
        model: "gpt-3.5-turbo",
      });
      AIResponse = chatCompletion.choices[0].message.content ?? "null";
    } catch (error) {
      console.error("OPEN AI API CALL ERROR:", error);
    }

    // Specifying these variables as output will allow them to be used by the next step in the workflow
    return {
      outputs: {
        ai_incident_response: AIResponse,
      },
    };
  },
);
