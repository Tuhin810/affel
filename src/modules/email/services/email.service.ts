import { IEmailProvider }
from "../interfaces/IEmailProvider";

export class EmailService {

  constructor(
    private readonly provider:
      IEmailProvider
  ) {}

  async sendOtpEmail(
    email: string,
    otp: string
  ): Promise<void> {

    await this.provider.sendEmail(
      email,
      "Email Verification OTP",
      `
      <h2>Your OTP</h2>
      <h1>${otp}</h1>
      `
    );
  }
}