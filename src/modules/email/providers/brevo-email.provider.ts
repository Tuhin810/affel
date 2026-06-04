import { BrevoClient } from "@getbrevo/brevo";

import { IEmailProvider }
from "../interfaces/IEmailProvider";

export class BrevoEmailProvider
  implements IEmailProvider
{
  private client: BrevoClient;

  constructor() {

    this.client =
      new BrevoClient({
        apiKey:
          process.env.BREVO_API_KEY!,
      });
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string
  ): Promise<void> {

    await this.client
      .transactionalEmails
      .sendTransacEmail({
        sender: {
          email:
            process.env.BREVO_SENDER_EMAIL!,
          name:
            process.env.BREVO_SENDER_NAME!,
        },

        to: [
          {
            email: to,
          },
        ],

        subject,

        htmlContent,
      });
  }
}