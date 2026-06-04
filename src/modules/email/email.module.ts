import { BrevoEmailProvider }
from "./providers/brevo-email.provider";

import { EmailService }
from "./services/email.service";

const brevoEmailProvider =
  new BrevoEmailProvider();

export const emailService =
  new EmailService(brevoEmailProvider);
