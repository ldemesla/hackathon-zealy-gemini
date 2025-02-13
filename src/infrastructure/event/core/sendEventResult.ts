import type { TransportNames, TransportReturnTypes } from './event.interface';

export class SendEventResult<EventPayload> {
  constructor(private readonly resultsPerTransport: Dict<any> = {}) {}

  transports() {
    return Object.keys(this.resultsPerTransport) as TransportNames[];
  }

  get<TransportName extends TransportNames>(
    transport: TransportName,
  ): TransportReturnTypes<EventPayload>[TransportName] {
    let result: any = undefined;
    /* if (transport === 'bullmq') {
      if (this.resultsPerTransport['bullmq'] == null) {
        throw new Error('No bullmq transport invoked for this result');
      }
      result = this.resultsPerTransport['bullmq'];
    } */
    return result;
  }
}
