/*
  Gözlənilən xətalar üçün status kodu daşıyan xəta.
  Controller-də: throw new ApiError(404, "Product not found")
  errorHandler onu tutub eyni formatda cavab qaytarır.
*/
export default class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}
