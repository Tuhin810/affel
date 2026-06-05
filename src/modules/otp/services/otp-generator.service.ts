import crypto from "crypto";

export class OtpGeneratorService {
  private readonly length: number;

  constructor(length: number = 6) {
    this.length = length;
  }

  generate(): string {
    const max = Math.pow(10, this.length);
    const otp = crypto
      .randomInt(0, max)
      .toString()
      .padStart(this.length, "0");

    return otp;
  }
}
