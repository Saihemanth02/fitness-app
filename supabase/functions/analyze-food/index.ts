import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are a food nutrition analysis AI. Analyze the food and respond with ONLY valid JSON (no markdown, no code fences, no extra text).

Response format:
{
  "name": "Food Name",
  "emoji": "🍛",
  "calories": 250,
  "protein": 12,
  "carbs": 30,
  "fat": 8,
  "confidence": 93,
  "healthLabel": "Good",
  "alternative": { "name": "Healthier Alternative", "reason": "Lower calories, more protein" }
}

Rules:
- calories, protein, carbs, fat are per typical serving
- confidence is 0-100 (your certainty about the identification)
- healthLabel must be one of: "Excellent", "Good", "Moderate", "High Cal"
- alternative should suggest a healthier swap
- If you cannot identify food, set name to "Unknown Food" and confidence to 0
- Respond with ONLY the JSON object, nothing else`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { imageBase64, foodText } = body;

    // Validate: need either image or text
    if (!imageBase64 && !foodText) {
      return new Response(JSON.stringify({ error: "Either imageBase64 or foodText is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (foodText && (typeof foodText !== "string" || foodText.trim().length === 0 || foodText.length > 500)) {
      return new Response(JSON.stringify({ error: "foodText must be 1-500 characters" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (imageBase64 && imageBase64.length > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "Image too large (max 10MB)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build user message based on input type
    let userContent: any;
    if (imageBase64) {
      userContent = [
        { type: "text", text: "Identify this food, estimate its nutritional content per serving, and suggest a healthier alternative." },
        { type: "image_url", image_url: { url: imageBase64 } },
      ];
    } else {
      userContent = `Analyze this food item and estimate its nutritional content per typical serving: "${foodText!.trim()}". Provide accurate macros and suggest a healthier alternative.`;
    }

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
          { role: "user", content: userContent },
        ],
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
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Could not parse AI response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate required fields
    if (!parsed.name || !Number.isFinite(parsed.calories)) {
      return new Response(JSON.stringify({ error: "Invalid AI response structure" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-food error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
