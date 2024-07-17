import { Manifest } from "deno-slack-sdk/mod.ts";
import { GenerateAIResponse } from "./functions/ai_incident_response.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  name: "generic-ai-function",
  description: "Summarize an incident message",
  icon: "assets/default_new_app_icon.png",
  functions: [GenerateAIResponse],
  workflows: [],
  outgoingDomains: ["api.openai.com"],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "channels:history",
  ],
});
