import { EventRegistry, payloadDefinition } from "./core/eventRegistry";
import { TransportRegistry } from "./core/transportRegistry";

const EVENT_DEFINITIONS = new EventRegistry({})
  .registerEvent(
    "upload-pdf",
    payloadDefinition<{
      name: string;
      mimeType: string;
      sizeBytes: string;
      createTime: string;
      updateTime: string;
      expirationTime: string;
      sha256Hash: string;
      uri: string;
      state: string;
    }>()
  )
  .registerEvent(
    "rate-answers",
    payloadDefinition<{
      answers: {
        answer: string;
        question: string;
      }[];
      uri: string;
    }>()
  );
const TRANSPORT_CONFIGS = new TransportRegistry(EVENT_DEFINITIONS, {});

TRANSPORT_CONFIGS.configureEventTransport(
  "upload-pdf",
  "inngest",
  {}
).configureEventTransport("rate-answers", "inngest", {});

export { EVENT_DEFINITIONS, TRANSPORT_CONFIGS };
