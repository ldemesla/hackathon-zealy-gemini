import { Inngest, InngestFunction } from "inngest";

import type { ConsumerRegistry } from "../consumerRegistry";
import type {
  InngestSendEventOptions,
  InngestTransportOptions,
  TransportImplementation,
} from "../event.interface";
import type { TransportRegistry } from "../transportRegistry";

export class InngestTransport
  implements
    TransportImplementation<InngestSendEventOptions, InngestTransportOptions>
{
  private readonly functions: InngestFunction.Any[];

  constructor(
    private readonly inngest: Inngest,
    private readonly consumerRegistry: ConsumerRegistry,
    transportRegistry: TransportRegistry<any, any, any>
  ) {
    const events =
      transportRegistry.getTransportConfigsByTransport<InngestSendEventOptions>(
        "inngest"
      );

    this.functions = Object.entries(events).map(([eventName, eventConfig]) =>
      this.getFunction(eventName, eventConfig)
    );
  }

  async send(
    eventName: string,
    payload: Dict<any>,
    config?: InngestSendEventOptions,
    options?: InngestTransportOptions
  ) {
    await this.inngest.send({
      ...(config?.id ? { id: config.id(payload) } : {}),
      name: eventName,
      data: {
        payload,
        options,
      },
    });
  }

  async start() {
    // nothing to start
  }

  async stop() {
    // nothing to stop
  }

  getFunctions() {
    console.log("getFunctions", this.functions);
    return this.functions;
  }

  private getFunction(eventName: string, config: InngestSendEventOptions) {
    const triggers = [
      { event: eventName },
      ...(config.cron ? [{ cron: config.cron }] : []),
    ];
    return this.inngest.createFunction(
      {
        id: `${eventName}-function`,
        retries: config.retries ?? 0,
        throttle: config.throttle,
        debounce: config.debounce,
      },
      triggers,
      async ({ event, step }) => {
        const { options, payload } = event.data;
        if (options?.delay) {
          await step.sleep("delay", options.delay);
        } else if (options?.startTime) {
          await step.sleepUntil("startTime", options.startTime);
        }

        const consumers = this.consumerRegistry.getEventConsumers(eventName);
        if (!consumers || consumers.length === 0) {
          console.warn("No consumer for event", eventName);
          return { success: false, error: "no.registered.consumer", eventName };
        }

        await Promise.all(consumers.map((consumer) => consumer(payload)));

        return { success: true };
      }
    );
  }
}
