import { fromNotification } from "./from-notification";
import { fromStreaming } from "./from-streaming";

(async () => {
  try {
    await fromStreaming();
    // await fromNotification();
  } catch (error) {
    console.error(error);
  }
})();
