// the event service must always start before consumer subscriptions are made
import "@/infrastructure/event/event.service";
import "@/infrastructure/event/subscriptions";

// we reexport the event service, ensuring that subscriptions are made
export { eventService } from "@/infrastructure/event/event.service";
