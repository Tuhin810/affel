import { IOtpProvider }
from "../interfaces/IOtpProvider";

export class EmailOtpProvider
  implements IOtpProvider
{
  async sendOtp(
    email: string,
    otp: string
  ): Promise<void> {

    console.log(
      `Email OTP ${otp} sent to ${email}`
    );

  }
}