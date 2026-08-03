import { defineAgent } from "eve";

import { MARION_CHAT_MODEL, MARION_CHAT_MODEL_FALLBACK } from "./lib/models";

export default defineAgent({
  model: MARION_CHAT_MODEL,
  modelOptions: {
    providerOptions: {
      gateway: {
        models: [MARION_CHAT_MODEL_FALLBACK],
      },
    },
  },
});
