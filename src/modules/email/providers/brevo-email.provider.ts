import * as Brevo from "@getbrevo/brevo";

import { IEmailProvider }
from "../interfaces/IEmailProvider";

export class BrevoEmailProvider
  implements IEmailProvider
{
  private apiInstance: Brevo.TransactionalEmailsApi;

  constructor() {

    this.apiInstance =
      new Brevo.TransactionalEmailsApi();

    this.apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY!
    );
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string
  ): Promise<void> {

    await this.apiInstance.sendTransacEmail({
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