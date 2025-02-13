import { Inngest } from 'inngest';

import { InngestTransport } from '@/infrastructure/event/core/inngest/inngestTransport';

import type { EventRegistry } from './eventRegistry';
import type { TransportRegistry } from './transportRegistry';
import { ConsumerRegistry } from './consumerRegistry';
import {
  ExtractPayload,
  IEventService,
  PayloadDefinition,
  QueueConfigs,
  TransportImplementation,
  TransportImplementations,
  TransportNames,
  TransportOptions,
} from './event.interface';
import { LocalTransport } from './local/localTransport';
import { SendEventResult } from './sendEventResult';

export class EventService<
  EventRegistryData extends Record<string, PayloadDefinition<any>>,
  EventNames extends keyof EventRegistryData,
  QueueConfigData extends QueueConfigs,
> implements IEventService<EventRegistryData, EventNames, QueueConfigData>
{
  private consumerRegistry: ConsumerRegistry = new ConsumerRegistry();

  private transports: Dict<TransportImplementation<any>> = {};

  constructor(
    private readonly eventRegistry: EventRegistry<EventRegistryData>,
    private readonly transportRegistry: TransportRegistry<
      EventRegistryData,
      EventNames,
      QueueConfigData
    >,
    inngest: Inngest,
  ) {
    this.transports['inngest'] = new InngestTransport(
      inngest,
      this.consumerRegistry,
      transportRegistry,
    );
    this.transports['local'] = new LocalTransport(this.consumerRegistry);
  }

  subscribe<
    EventName extends EventNames,
    EventPayload extends ExtractPayload<EventRegistryData[EventName]>,
  >(eventName: EventName, consumer: (payload: EventPayload) => Promise<void>) {
    this.consumerRegistry.subscribe(eventName as string, consumer);
  }

  async send<
    EventName extends EventNames,
    EventPayload extends ExtractPayload<EventRegistryData[EventName]>,
  >(
    eventName: EventName,
    payload: EventPayload,
    transportOptions?: TransportOptions,
  ): Promise<SendEventResult<EventPayload>> {
    const validated = this.eventRegistry.validateEvent(eventName as string, payload);
    const transportResults: Dict<any> = {};
    if (!validated) {
      console.warn({
        message: '[EventService] invalid event',
        eventName,
        payload,
      });
      return new SendEventResult<EventPayload>(transportResults);
    }

    const transportConfigs = Object.entries(
      this.transportRegistry.getTransportConfigsByEvent(eventName),
    );
    if (transportConfigs.length === 0) {
      console.warn({
        message: '[EventService] no transport for event',
        eventName,
      });
      return new SendEventResult<EventPayload>(transportResults);
    }
    const promises = transportConfigs.map(async ([transportName, transportConfig]) => {
      const transport = this.transports[transportName];
      if (transport) {
        transportResults[transportName] = await transport.send(
          eventName as string,
          payload,
          transportConfig,
          (transportOptions as Maybe<Dict<any>>)?.[transportName],
        );
      } else {
        console.warn({
          message: '[EventService] transport not found',
          eventName,
          transportName,
        });
      }
    });
    await Promise.allSettled(promises);
    return new SendEventResult<EventPayload>(transportResults);
  }

  async sendMany<
    EventName extends EventNames,
    EventPayload extends ExtractPayload<EventRegistryData[EventName]>,
  >(eventName: EventName, payloads: EventPayload[]): Promise<SendEventResult<EventPayload>[]> {
    const promises = payloads.map(async payload => this.send(eventName, payload));
    return Promise.all(promises);
  }

  getEventRegistry() {
    return this.eventRegistry;
  }

  async startWorkers() {
    await Promise.all(Object.values(this.transports).map(transport => transport.start()));
  }

  async stopWorkers() {
    await Promise.all(Object.values(this.transports).map(transport => transport.stop()));
  }

  getTransport<TransportName extends TransportNames>(transportName: TransportName) {
    const transport = this.transports[transportName];
    if (!transport) {
      throw new Error(`Transport ${transport} not found`);
    }
    return transport as TransportImplementations[TransportName];
  }
}
