export interface IOtpProvider {
  sendOtp(
    destination: string,
    otp: string
  ): Promise<void>;
}