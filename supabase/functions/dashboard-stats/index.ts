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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all symptom checks
    const { data: checks, error } = await supabase
      .from("symptom_checks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const allChecks = checks || [];

    // Total checks
    const totalChecks = allChecks.length;

    // Severity distribution
    const severityCounts = { low: 0, moderate: 0, high: 0 };
    allChecks.forEach((c) => {
      if (c.severity in severityCounts) {
        severityCounts[c.severity as keyof typeof severityCounts]++;
      }
    });

    // Top diagnoses
    const diagnosisCounts: Record<string, number> = {};
    allChecks.forEach((c) => {
      diagnosisCounts[c.diagnosis] = (diagnosisCounts[c.diagnosis] || 0) + 1;
    });
    const topDiagnoses = Object.entries(diagnosisCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    // Daily checks (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyCounts: Record<string, number> = {};
    allChecks
      .filter((c) => new Date(c.created_at) >= thirtyDaysAgo)
      .forEach((c) => {
        const day = c.created_at.split("T")[0];
        dailyCounts[day] = (dailyCounts[day] || 0) + 1;
      });
    const dailyChecks = Object.entries(dailyCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    // Language distribution
    const langCounts: Record<string, number> = {};
    allChecks.forEach((c) => {
      langCounts[c.language] = (langCounts[c.language] || 0) + 1;
    });

    // Common symptoms
    const symptomCounts: Record<string, number> = {};
    allChecks.forEach((c) => {
      (c.symptoms || []).forEach((s: string) => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
    });
    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Average confidence
    const avgConfidence = totalChecks > 0
      ? Math.round(allChecks.reduce((sum, c) => sum + c.confidence, 0) / totalChecks)
      : 0;

    return new Response(
      JSON.stringify({
        totalChecks,
        severityCounts,
        topDiagnoses,
        dailyChecks,
        languageDistribution: langCounts,
        topSymptoms,
        avgConfidence,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("dashboard-stats error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
