export function successResponse(data = {}, message = "Success") {
  return { success: true, message, data };
}
export function errorResponse(error = "An error occurred", code = 400) {
  return { success: false, error, code };
}
