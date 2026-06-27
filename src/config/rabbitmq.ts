import amqp from "amqplib";
import logger from "./logger";
import { env } from "./env";

export class RabbitMQService {
  private static connection: any = null;
  private static channel: any = null;
  private static readonly EXCHANGE = "affiliate_events";

  public static async connect(): Promise<void> {
    try {
      if (this.connection) return;

      logger.info("Connecting to RabbitMQ...");
      // Cast the amqp import to any to resolve callback/promise type definitions differences
      this.connection = await (amqp as any).connect(env.rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Declare topic exchange
      await this.channel.assertExchange(this.EXCHANGE, "topic", { durable: true });

      this.connection.on("error", (error: any) => {
        logger.error(`RabbitMQ Connection Error: ${error.message}`);
        this.connection = null;
        this.channel = null;
      });

      this.connection.on("close", () => {
        logger.warn("RabbitMQ Connection Closed. Reconnecting in 5s...");
        this.connection = null;
        this.channel = null;
        setTimeout(() => this.connect(), 5000);
      });

      logger.info("RabbitMQ connected successfully");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      logger.error(`Failed to connect to RabbitMQ: ${msg}`);
      // Retry connection
      setTimeout(() => this.connect(), 5000);
    }
  }

  public static async publish(routingKey: string, payload: any): Promise<boolean> {
    try {
      if (!this.channel) {
        logger.warn(`RabbitMQ channel not open. Cannot publish event: ${routingKey}`);
        return false;
      }
      const message = JSON.stringify(payload);
      const published = this.channel.publish(this.EXCHANGE, routingKey, Buffer.from(message), {
        persistent: true,
      });
      if (published) {
        logger.debug(`Published event to RabbitMQ: ${routingKey}`);
      }
      return published;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      logger.error(`Failed to publish RabbitMQ event: ${msg}`);
      return false;
    }
  }

  public static async consume(
    queueName: string,
    routingKey: string,
    onMessage: (payload: any) => Promise<void>
  ): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error("RabbitMQ channel is not initialized");
      }

      await this.channel.assertQueue(queueName, { durable: true });
      await this.channel.bindQueue(queueName, this.EXCHANGE, routingKey);

      await this.channel.consume(
        queueName,
        async (msg: any) => {
          if (!msg) return;
          try {
            const content = JSON.parse(msg.content.toString());
            logger.info(`RabbitMQ received message in queue ${queueName} [${routingKey}]`);
            await onMessage(content);
            this.channel?.ack(msg);
          } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Unknown error";
            logger.error(`Error processing RabbitMQ message: ${errMsg}`);
            // Reject message and place it back to queue
            this.channel?.nack(msg, false, true);
          }
        },
        { noAck: false }
      );
      logger.info(`Subscribed to queue ${queueName} bound to routing key ${routingKey}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      logger.error(`Failed to consume from queue ${queueName}: ${msg}`);
    }
  }
}
