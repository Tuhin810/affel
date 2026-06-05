export class ApiResponse {

  static success(
    data: unknown,
    message = "Success"
  ) {

    return {
      success: true,
      message,
      data,
    };
  }

}
