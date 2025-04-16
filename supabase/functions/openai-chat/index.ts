import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { message } = await req.json();
    // Simple echo response for testing
    return new Response(
      JSON.stringify({ reply: `You said: ${message}` }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Invalid request or missing 'message' field." }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
