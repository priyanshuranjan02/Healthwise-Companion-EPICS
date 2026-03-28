import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms, language = "en" } = await req.json();

    if (!symptoms || typeof symptoms !== "string" || symptoms.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide symptoms" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI medical symptom analyzer for a rural healthcare triage system called AI HealthBot. 
Given patient symptoms, provide a structured assessment.

IMPORTANT: You must respond ONLY with a valid JSON object (no markdown, no code fences). Use this exact structure:
{
  "disease": "Name of the most likely condition",
  "confidence": 75,
  "severity": "low",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3", "recommendation 4"],
  "symptoms": ["symptom 1", "symptom 2", "symptom 3"]
}

Rules:
- "confidence" must be an integer from 30-95
- "severity" must be one of: "low", "moderate", "high"
- "recommendations" must have 3-5 items with actionable advice
- "symptoms" should list the key symptoms you identified from the input
- If language is Hindi, provide disease name and recommendations in Hindi
- Always include a disclaimer-style recommendation about consulting a doctor
- Be medically responsible — do not over-diagnose`;

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
          {
            role: "user",
            content: `Patient symptoms (language: ${language}): ${symptoms}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the AI response
    let diagnosis;
    try {
      // Try to extract JSON from possible markdown code fences
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      diagnosis = JSON.parse(jsonMatch[1].trim());
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI diagnosis");
    }

    // Validate the response structure
    if (!diagnosis.disease || !diagnosis.confidence || !diagnosis.severity || !diagnosis.recommendations) {
      throw new Error("Invalid diagnosis structure from AI");
    }

    // Ensure severity is valid
    if (!["low", "moderate", "high"].includes(diagnosis.severity)) {
      diagnosis.severity = "moderate";
    }

    // Store in database
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get user from auth header if present
      const authHeader = req.headers.get("authorization");
      let userId = null;
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      }

      await supabase.from("symptom_checks").insert({
        user_id: userId,
        symptoms: diagnosis.symptoms || [],
        diagnosis: diagnosis.disease,
        confidence: diagnosis.confidence,
        severity: diagnosis.severity,
        recommendations: diagnosis.recommendations,
        language,
      });
    } catch (dbError) {
      console.error("Failed to store symptom check:", dbError);
      // Don't fail the request if DB insert fails
    }

    return new Response(JSON.stringify(diagnosis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-symptoms error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
