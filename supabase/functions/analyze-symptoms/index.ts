import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANG_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  es: "Spanish",
  fr: "French",
  ar: "Arabic",
  zh: "Chinese",
  pt: "Portuguese",
  bn: "Bengali",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language = "en" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const langName = LANG_NAMES[language] || "English";

    const systemPrompt = `You are an experienced AI Health Assistant. Analyze the user's symptoms carefully and empathetically.

ALWAYS respond ONLY in ${langName}.

Format your reply as clean, well-structured GitHub-Flavored Markdown using the EXACT section headings below. Each section header MUST be on its own line as bold text, followed by content on new lines. Use bullet lists where appropriate. Add a blank line between sections.

**Possible Condition:** <short name>

**Severity:** <low | moderate | high>

**Confidence:** <0-100>%

**Summary**
A short 1-2 sentence empathetic explanation of what may be happening.

**Symptoms Identified**
- symptom one
- symptom two

**Possible Causes**
- cause one
- cause two

**Recommendations**
- actionable recommendation one
- actionable recommendation two
- actionable recommendation three

**When to See a Doctor**
- warning sign one
- warning sign two

**Self-Care Tips**
- tip one
- tip two

---

**Disclaimer:** This is not a medical diagnosis. Please consult a qualified healthcare professional for proper evaluation.

Rules:
- Always include EVERY section above, each on its own line with a blank line between sections — never put multiple sections on the same line.
- If symptoms suggest emergency (chest pain, stroke signs, severe bleeding, breathing difficulty), set Severity: high and urge immediate emergency care in the Recommendations.
- Be empathetic, clear, and concise.
- Ask follow-up questions only if symptoms are too vague to assess.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Lovable workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("analyze-symptoms error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
