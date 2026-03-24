import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { orchestrateRose } from "./lib/orchestrator.ts";
import { OrchestratorInput } from "./lib/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export async function handleRequest(req: Request): Promise<Response> {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Method not allowed",
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const body = await req.json() as OrchestratorInput;

    if (!body?.user_id || !body?.message) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Missing user_id or message",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const result = await orchestrateRose({
      user_id: body.user_id,
      conversation_id: body.conversation_id ?? null,
      message: body.message,
      history: body.history ?? [],
    });

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Rose handleRequest error:", error);

    return new Response(
      JSON.stringify({
        ok: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
}

serve(handleRequest);