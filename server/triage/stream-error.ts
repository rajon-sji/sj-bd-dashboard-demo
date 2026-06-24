/** Map provider / infra errors to safe, actionable UI messages. */
export function triageStreamErrorMessage(error: unknown): string {
  if (error == null) return "Something went wrong. Please try again.";

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);

  const lower = message.toLowerCase();

  if (
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("resource_exhausted")
  ) {
    return "Gemini API quota exceeded. Check billing at Google AI Studio, or wait a minute and retry.";
  }

  if (lower.includes("api key") || lower.includes("api_key")) {
    return "Missing or invalid GOOGLE_GENERATIVE_AI_API_KEY. Add it in .env locally and in Vercel project settings.";
  }

  if (lower.includes("missing supabase")) {
    return "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and your anon key in environment variables.";
  }

  if (
    lower.includes("response mime type") &&
    lower.includes("application/json")
  ) {
    return "This Gemini model cannot combine tool calling with JSON mode. Use gemini-2.5-flash (default) or enable billing for gemini-2.0-flash.";
  }

  if (lower.includes("not found for api version") && lower.includes("model")) {
    return "Configured Gemini model is unavailable. Set GOOGLE_GENERATIVE_AI_MODEL to a supported model (default: gemini-2.5-flash).";
  }

  // Avoid leaking raw provider payloads; keep a short hint for debugging.
  const short = message.split("\n")[0]?.slice(0, 200);
  return short || "Something went wrong. Please try again.";
}
