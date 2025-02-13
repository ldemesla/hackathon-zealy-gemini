/* eslint-disable @typescript-eslint/no-unused-vars */

import type { ZodObject } from 'zod';
import { InngestFunction } from 'inngest';

import { InngestTransport } from '@/infrastructure/event/core/inngest/inngestTransport';
import { LocalTransport } from '@/infrastructure/event/core/local/localTransport';

import type { SendEventResult } from './sendEventResult';

export type ExtractPayload<T> =
  T extends PayloadDefinition<infer EventPayload> ? EventPayload : never;

export interface PayloadDefinition<EventPayload> {
  schema?: ZodObject<any>;
}

export interface TransportImplementation<SendEventOptions, TransportSpecificOptions = undefined> {
  send(
    eventName: string,
    payload: Dict<any>,
    config: SendEventOptions,
    transportSpecificOptions?: TransportSpecificOptions,
  ): Promise<any>;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export type SendEventOptions<EventPayload = any> = object;

export type EventConsumer<EventPayload = any> = (payload: EventPayload) => Promise<void>;

export interface IEventService<
  EventRegistryData extends Record<string, PayloadDefinition<any>>,
  EventNames extends keyof EventRegistryData,
  QueueConfigData extends QueueConfigs,
> {
  subscribe<
    EventName extends EventNames,
    EventPayload extends ExtractPayload<EventRegistryData[EventName]>,
  >(
    eventName: EventName,
    consumer: (payload: EventPayload) => Promise<void>,
  ): void;

  send<
    EventName extends EventNames,
    EventPayload extends ExtractPayload<EventRegistryData[EventName]>,
  >(
    eventName: EventName,
    payload: EventPayload,
  ): Promise<SendEventResult<EventPayload>>;

  sendMany<
    EventName extends EventNames,
    EventPayload extends ExtractPayload<EventRegistryData[EventName]>,
  >(
    eventName: EventName,
    payloads: EventPayload[],
  ): Promise<SendEventResult<EventPayload>[]>;

  startWorkers(): Promise<void>;

  stopWorkers(): Promise<void>;

  getTransport<TransportName extends TransportNames>(
    transportName: TransportName,
  ): TransportImplementations[TransportName];
}

/** QUEUE CONFIGS **/

/* export interface BullMqQueueConfig {
  queueOptions?: Omit<QueueOptions, 'connection'>;
  workerOptions?: Omit<WorkerOptions, 'connection'>;
  noWorker?: boolean;
} */

export interface QueueConfigs {
  // bullmq: Dict<BullMqQueueConfig>;
  local?: undefined;
  inngest?: undefined;
}

/** TRANSPORT OPTIONS **/

export type TransportImplementations = {
  local: LocalTransport;
  inngest: InngestTransport;
};

/* export interface BullMqSendEventOptions<EventPayload = unknown, QueueNames = string>
  extends SendEventOptions<EventPayload> {
  queue: QueueNames;
  id?: (payload: EventPayload) => string | undefined;
  jobOptions?: JobsOptions;
} */

export interface InngestSendEventOptions<EventPayload = unknown>
  extends SendEventOptions<EventPayload> {
  id?: (payload: EventPayload) => string | undefined;
  throttle?: InngestFunction.Options<any>['throttle'];
  debounce?: InngestFunction.Options<any>['debounce'];
  retries?: InngestFunction.Options<any>['retries'];
  cron?: InngestFunction.Trigger<any>['cron'];
}

export type TransportNames = keyof TransportEventConfigTypes<void, void>;
export type QueueTransportNames = keyof QueueConfigs;

export type TransportEventConfigTypes<EventPayload, QueueNames> = {
  // bullmq: BullMqSendEventOptions<EventPayload, QueueNames>;
  local: Record<string, never>;
  inngest: InngestSendEventOptions<EventPayload>;
};

export type TransportReturnTypes<EventPayload> = {
  // bullmq: Job<EventPayload, void, string>;
  local: void;
  inngest: void;
};

export interface InngestTransportOptions {
  delay?: string | number; // https://www.inngest.com/docs/reference/functions/step-sleep
  startTime?: string; // https://www.inngest.com/docs/reference/functions/step-sleep-until
}

export type TransportOptions = {
  // bullmq?: JobsOptions;
  local?: never;
  inngest?: InngestTransportOptions;
};
