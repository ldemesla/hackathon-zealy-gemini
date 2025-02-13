import type {
  ExtractPayload,
  PayloadDefinition,
  QueueConfigs,
  QueueTransportNames,
  SendEventOptions,
  TransportEventConfigTypes,
  TransportNames,
} from "./event.interface";
import type { EventRegistry } from "./eventRegistry";

export class TransportRegistry<
  EventRegistryData extends Record<string, PayloadDefinition<any>>,
  EventNames extends keyof EventRegistryData,
  QueueConfigData extends QueueConfigs
> {
  private transportConfigsByEvents: Dict<Dict<SendEventOptions>> = {};

  constructor(
    private readonly eventRegistry: EventRegistry<EventRegistryData>,
    private readonly queuesPerTransport: QueueConfigData
  ) {}

  configureEventTransport<
    EventName extends EventNames,
    TransportName extends TransportNames,
    EventPayload extends ExtractPayload<EventRegistryData[EventName]>
  >(
    eventName: EventName,
    transportName: TransportName,
    transportConfig: TransportEventConfigTypes<
      EventPayload,
      TransportName extends QueueTransportNames
        ? keyof QueueConfigData[TransportName]
        : void
    >[TransportName]
  ) {
    const eventTransports =
      this.transportConfigsByEvents[eventName as string] ?? {};
    eventTransports[transportName] = transportConfig;
    this.transportConfigsByEvents[eventName as string] = eventTransports;
    return this;
  }

  getTransportConfigByEvent<T extends SendEventOptions>(
    eventName: EventNames,
    transport: TransportNames
  ) {
    return this.transportConfigsByEvents[eventName as string]?.[
      transport as string
    ] as T | undefined;
  }

  getTransportConfigsByEvent(eventName: EventNames) {
    return this.transportConfigsByEvents[eventName as string] ?? {};
  }

  getTransportConfigsByTransport<T extends SendEventOptions>(
    transport: TransportNames
  ) {
    const results: Dict<T> = {};
    Object.entries(this.transportConfigsByEvents).forEach(
      ([event, transports]) => {
        if (transports[transport]) {
          results[event] = transports[transport] as T;
        }
      }
    );
    return results;
  }

  getEventRegistry() {
    return this.eventRegistry;
  }

  getQueuesConfigs(transport: QueueTransportNames) {
    return this.queuesPerTransport[transport];
  }
}
