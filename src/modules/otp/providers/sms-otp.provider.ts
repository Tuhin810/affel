import { IOtpProvider }
from "../interfaces/IOtpProvider";

export class SmsOtpProvider
  implements IOtpProvider
{
  async sendOtp(
    phone: string,
    otp: string
  ): Promise<void> {

    console.log(
      `SMS OTP ${otp} sent to ${phone}`
    );

  }
}