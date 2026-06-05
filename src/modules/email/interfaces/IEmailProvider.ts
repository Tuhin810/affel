export interface IEmailProvider {
  sendEmail(
    to: string,
    subject: string,
    htmlContent: string
  ): Promise<void>;
}