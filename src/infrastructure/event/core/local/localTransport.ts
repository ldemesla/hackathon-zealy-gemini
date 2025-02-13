import type { ConsumerRegistry } from '../consumerRegistry';
import type { TransportImplementation } from '../event.interface';

export class LocalTransport implements TransportImplementation<Record<string, never>> {
  constructor(private readonly consumerRegistry: ConsumerRegistry) {}

  async send(eventName: string, payload: Dict<any>, config: Record<string, never>) {
    const consumers = this.consumerRegistry.getEventConsumers(eventName);
    if (consumers && consumers.length > 0) {
      await Promise.all(consumers.map(consumer => consumer(payload)));
    }
  }

  async start() {}

  async stop() {}
}
