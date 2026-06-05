export class EmailTemplateService {

  otpTemplate(
    otp: string
  ): string {

    return `
      <div>
        <h2>Email Verification</h2>

        <p>Your OTP is:</p>

        <h1>${otp}</h1>

        <p>
          Valid for 5 minutes.
        </p>
      </div>
    `;
  }
}