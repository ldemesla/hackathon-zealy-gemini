import type { EventConsumer } from './event.interface';

export class ConsumerRegistry {
  private consumersByEvents: Dict<EventConsumer[]> = {};

  subscribe(eventName: string, consumer: EventConsumer) {
    const availableConsumers = this.consumersByEvents[eventName] ?? [];
    availableConsumers.push(consumer);
    this.consumersByEvents[eventName] = availableConsumers;
  }

  getEventConsumers(eventName: string) {
    return this.consumersByEvents[eventName];
  }
}
