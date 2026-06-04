import { otpService }
from "../../otp/otp.module";

import { emailService }
from "../../email/email.module";

import { configService }
from "../../config/config.module";

export class AuthService {

  async sendEmailOtp(
    email: string
  ): Promise<void> {

    console.time("CONFIG");

    const otpExpiry =
      await configService.get(
        "OTP_EXPIRY_SECONDS"
      );

    console.timeEnd("CONFIG");

    console.time("OTP");

    const otp =
      await otpService.generateAndStoreOtp(
        email,
        Number(otpExpiry)
      );

    console.timeEnd("OTP");

    console.time("EMAIL");

    await emailService.sendOtpEmail(
      email,
      otp
    );

    console.timeEnd("EMAIL");
  }

  async verifyEmailOtp(
  email: string,
  otp: string
): Promise<void> {

  const isValid =
    await otpService.verifyOtp(
      email,
      otp
    );

  if (!isValid) {
    throw new Error(
      "Invalid OTP"
    );
  }
}
}