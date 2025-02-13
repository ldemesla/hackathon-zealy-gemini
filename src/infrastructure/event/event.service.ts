import { inngest } from "../inngest";
import { EventService as CoreEventService } from "./core/event.service";
import { EVENT_DEFINITIONS, TRANSPORT_CONFIGS } from "./events";

export const eventService = new CoreEventService(
  EVENT_DEFINITIONS,
  TRANSPORT_CONFIGS,
  inngest
);
