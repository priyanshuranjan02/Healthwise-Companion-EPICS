import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Activity, Users, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";

interface DashboardData {
  totalChecks: number;
  severityCounts: { low: number; moderate: number; high: number };
  topDiagnoses: { name: string; count: number }[];
  dailyChecks: { date: string; count: number }[];
  languageDistribution: Record<string, number>;
  topSymptoms: { name: string; count: number }[];
  avgConfidence: number;
}

const SEVERITY_COLORS = ["hsl(145, 63%, 42%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: result, error: fnError } = await supabase.functions.invoke("dashboard-stats");
        if (fnError) throw fnError;
        setData(result);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const severityPieData = data
    ? [
        { name: "Low", value: data.severityCounts.low },
        { name: "Moderate", value: data.severityCounts.moderate },
        { name: "High", value: data.severityCounts.high },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-lg font-bold text-foreground">
            <span className="text-gradient-primary">NGO</span> Dashboard
          </span>
        </button>
        <ThemeToggle />
      </nav>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-critical/30 bg-critical/5 p-6 text-center text-critical">
            {error}
          </div>
        ) : !data || data.totalChecks === 0 ? (
          <div className="py-20 text-center">
            <Activity className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground">No Data Yet</h2>
            <p className="mt-2 text-muted-foreground">Start health checks to populate the dashboard.</p>
            <button onClick={() => navigate("/")} className="mt-4 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg">
              Go to Health Check
            </button>
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Activity} label="Total Checks" value={data.totalChecks} />
              <StatCard icon={TrendingUp} label="Avg Confidence" value={`${data.avgConfidence}%`} />
              <StatCard icon={AlertTriangle} label="High Severity" value={data.severityCounts.high} color="text-critical" />
              <StatCard icon={Users} label="Languages Used" value={Object.keys(data.languageDistribution).length} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Daily trend */}
              {data.dailyChecks.length > 0 && (
                <ChartCard title="Daily Health Checks (Last 30 Days)">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data.dailyChecks}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                      <Line type="monotone" dataKey="count" stroke="hsl(205, 85%, 45%)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}

              {/* Severity distribution */}
              <ChartCard title="Severity Distribution">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={severityPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {severityPieData.map((_, i) => (
                        <Cell key={i} fill={SEVERITY_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Top diagnoses */}
              {data.topDiagnoses.length > 0 && (
                <ChartCard title="Top Diagnoses">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.topDiagnoses} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                      <Bar dataKey="count" fill="hsl(205, 85%, 45%)" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}

              {/* Top symptoms */}
              {data.topSymptoms.length > 0 && (
                <ChartCard title="Most Common Symptoms">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.topSymptoms}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                      <Bar dataKey="count" fill="hsl(160, 60%, 45%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color?: string }) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
        <Icon className={`h-5 w-5 ${color || "text-primary"}`} />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
    <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
    {children}
  </div>
);

export default Dashboard;
