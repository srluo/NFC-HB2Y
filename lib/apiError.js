export function apiError(code, httpStatus = 400) {
  return new Response(
    JSON.stringify({ status: "error", code }),
    { status: httpStatus, headers: { "Content-Type": "application/json; charset=utf-8" } }
  );
}
