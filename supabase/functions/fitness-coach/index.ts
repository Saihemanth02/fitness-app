import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Authenticate the user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, userContext } = await req.json();

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== "string" || msg.content.length > 2000) {
        return new Response(JSON.stringify({ error: "Invalid message format" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Validate userContext
    if (!userContext || typeof userContext !== "object") {
      return new Response(JSON.stringify({ error: "userContext is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize userContext values
    const sanitize = (val: unknown, maxLen = 100): string => {
      return String(val ?? "").slice(0, maxLen).replace(/[<>]/g, "");
    };
    const sanitizeNum = (val: unknown): number => {
      const n = Number(val);
      return isNaN(n) ? 0 : Math.min(Math.max(n, 0), 100000);
    };

    const name = sanitize(userContext.name, 50);
    const goal = sanitize(userContext.goal, 100);
    const activityLevel = sanitize(userContext.activityLevel, 50);
    const caloriesEaten = sanitizeNum(userContext.caloriesEaten);
    const streak = sanitizeNum(userContext.streak);
    const weight = sanitizeNum(userContext.weight);
    const height = sanitizeNum(userContext.height);
    const age = sanitizeNum(userContext.age);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are FitGenius AI Coach — a world-class fitness, nutrition, and wellness expert.
The user's name is ${name}.
Their fitness goal is: ${goal}.
Activity level: ${activityLevel}.
Today's calories eaten: ${caloriesEaten} kcal.
Current streak: ${streak} days.
Weight: ${weight} kg, Height: ${height} cm, Age: ${age}.

Rules:
- Keep responses under 80 words. Be motivating, specific, and actionable.
- Reference their actual data (calories, streak, goal) in every response.
- Use emojis sparingly for energy. Give concrete tips, not generic advice.
- If asked about meals, suggest specific Indian & international food options with calorie estimates.
- If asked about workouts, recommend specific exercises matching their goal.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
