import { Inngest } from 'inngest';
import { describe, expect, test } from 'vitest';
import { z } from 'zod';

import { mockInterface } from '@/utils/mockInterface';

import { EventService } from '../event.service';
import { EventRegistry, payloadDefinition, payloadDefinitionWithSchema } from '../eventRegistry';
import { TransportRegistry } from '../transportRegistry';

const inngest = mockInterface<Inngest>();

describe('event service', () => {
  test('should validate event schema if provided', async () => {
    // Arrange
    const eventRegistry = new EventRegistry({})
      .registerEvent(
        'VALIDATED_EVENT',
        payloadDefinitionWithSchema(z.object({ value: z.string() })),
      )
      .registerEvent('NOT_VALIDATED_EVENT', payloadDefinition<{ value: string }>());

    const transportRegistry = new TransportRegistry(eventRegistry, {})
      .configureEventTransport('VALIDATED_EVENT', 'local', {})
      .configureEventTransport('NOT_VALIDATED_EVENT', 'local', {});

    const eventService = new EventService(eventRegistry, transportRegistry, inngest);

    let receivedValue1: any | undefined;
    eventService.subscribe('VALIDATED_EVENT', async ({ value }) => {
      receivedValue1 = value;
    });
    let receivedValue2: any | undefined;
    eventService.subscribe('NOT_VALIDATED_EVENT', async ({ value }) => {
      receivedValue2 = value;
    });

    // Act
    await eventService.send('VALIDATED_EVENT', { value: <any>10 });
    await eventService.send('NOT_VALIDATED_EVENT', { value: <any>10 });

    // Assert
    expect(receivedValue1).not.toBeDefined();
    expect(receivedValue2).toBe(10);
  });

  test('should route events to proper subscribers', async () => {
    // Arrange
    const eventRegistry = new EventRegistry({})
      .registerEvent('NUMBER_EVENT', payloadDefinition<{ value: number }>())
      .registerEvent('STRING_EVENT', payloadDefinition<{ value: string }>());

    const transportRegistry = new TransportRegistry(eventRegistry, {})
      .configureEventTransport('NUMBER_EVENT', 'local', {})
      .configureEventTransport('STRING_EVENT', 'local', {});

    const eventService = new EventService(eventRegistry, transportRegistry, inngest);

    let receivedNumber: number | undefined;
    let receivedString: string | undefined;
    eventService.subscribe('NUMBER_EVENT', async ({ value }) => {
      receivedNumber = value;
    });
    eventService.subscribe('STRING_EVENT', async ({ value }) => {
      receivedString = value;
    });

    // Act
    await eventService.send('STRING_EVENT', { value: 'hello' });

    // Assert
    expect(receivedNumber).not.toBeDefined();
    expect(receivedString).toBe('hello');
  });

  test('should support multiple subscribers', async () => {
    // Arrange
    const eventRegistry = new EventRegistry({}).registerEvent(
      'TEST_EVENT',
      payloadDefinition<{ value: number }>(),
    );

    const transportRegistry = new TransportRegistry(eventRegistry, {}).configureEventTransport(
      'TEST_EVENT',
      'local',
      {},
    );

    const eventService = new EventService(eventRegistry, transportRegistry, inngest);

    let receivedValue1;
    let receivedValue2;
    eventService.subscribe('TEST_EVENT', async ({ value }) => {
      receivedValue1 = value;
    });
    eventService.subscribe('TEST_EVENT', async ({ value }) => {
      receivedValue2 = value;
    });

    // Act
    await eventService.send('TEST_EVENT', { value: 10 });

    // Assert
    expect(receivedValue1).toBe(10);
    expect(receivedValue2).toBe(10);
  });

  test('should support multiple transports', async () => {
    // Arrange
    const eventRegistry = new EventRegistry({}).registerEvent(
      'TEST_EVENT',
      payloadDefinition<{ value: number }>(),
    );

    const transportRegistry = new TransportRegistry(eventRegistry, {})
      .configureEventTransport('TEST_EVENT', 'local', {})
      .configureEventTransport('TEST_EVENT', 'inngest', {});

    const eventService = new EventService(eventRegistry, transportRegistry, inngest);

    let receivedValue;
    eventService.subscribe('TEST_EVENT', async ({ value }) => {
      receivedValue = value;
    });

    // Act
    await eventService.send('TEST_EVENT', { value: 10 });

    // Assert
    expect(inngest.send).toHaveBeenNthCalledWith(1, {
      name: 'TEST_EVENT',
      data: {
        payload: { value: 10 },
        options: undefined,
      },
    });

    expect(receivedValue).toBe(10);
  });
});
