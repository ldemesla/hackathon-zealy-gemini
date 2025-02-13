import type { z, ZodObject } from 'zod';

import type { PayloadDefinition } from './event.interface';

export const payloadDefinitionWithSchema = <Schema extends ZodObject<any>>(
  schema: Schema,
): PayloadDefinition<z.infer<Schema>> => ({
  schema,
});

export const payloadDefinition = <Payload extends Dict<any>>(): PayloadDefinition<Payload> => ({});

export class EventRegistry<T extends Record<string, PayloadDefinition<any>>> {
  constructor(private readonly events: T) {}

  registerEvent<K extends string, P extends PayloadDefinition<any>>(key: K, payload: P) {
    return new EventRegistry<T & Record<K, P>>({
      ...this.events,
      [key]: payload,
    });
  }

  registerEvents<E extends Record<string, PayloadDefinition<any>>>(events: EventRegistry<E>) {
    return new EventRegistry<T & E>({
      ...this.events,
      ...events.events,
    });
  }

  validateEvent(eventName: string, payload: unknown): boolean {
    const eventDefinition = this.events[eventName];
    if (!eventDefinition) {
      return false;
    }
    const { schema } = eventDefinition;
    if (!schema) {
      return true;
    }
    return schema.safeParse(payload).success;
  }
}
