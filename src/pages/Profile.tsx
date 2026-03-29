import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Save, Loader2, Building2, MapPin, Phone, Mail, History, Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  phone: string;
  organization_name: string;
  region: string;
  contact_info: string;
  role: string;
}

interface SymptomCheck {
  id: string;
  diagnosis: string;
  severity: string;
  confidence: number;
  symptoms: string[];
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<SymptomCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "history" | "settings">("profile");

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [orgName, setOrgName] = useState("");
  const [region, setRegion] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [role, setRole] = useState("user");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Fetch profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (prof) {
        setProfile(prof as Profile);
        setFullName(prof.full_name || "");
        setPhone(prof.phone || "");
        setOrgName(prof.organization_name || "");
        setRegion(prof.region || "");
        setContactInfo(prof.contact_info || "");
        setRole(prof.role || "user");
      }

      // Fetch symptom check history
      const { data: checks } = await supabase
        .from("symptom_checks")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (checks) setHistory(checks as SymptomCheck[]);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        organization_name: orgName,
        region,
        contact_info: contactInfo,
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile updated!");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate("/");
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent!");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const severityColor = (s: string) => {
    if (s === "high") return "bg-destructive/10 text-destructive border-destructive/30";
    if (s === "moderate") return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
    return "bg-green-500/10 text-green-600 border-green-500/30";
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "history" as const, label: "History", icon: History },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-lg font-bold text-foreground">
            <span className="text-gradient-primary">My</span> Account
          </span>
        </button>
        <ThemeToggle />
      </nav>

      <div className="container mx-auto max-w-3xl px-4 py-6">
        {/* User header */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{fullName || "User"}</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className="mt-1 inline-block rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
              {role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-border bg-muted/50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground">Personal Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={User} label="Full Name" value={fullName} onChange={setFullName} placeholder="Your full name" />
              <Field icon={Phone} label="Phone" value={phone} onChange={setPhone} placeholder="+91 98765 43210" />
              <Field icon={Mail} label="Email" value={user?.email || ""} onChange={() => {}} disabled />
            </div>

            <hr className="border-border" />
            <h2 className="text-base font-semibold text-foreground">NGO / Organization Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={Building2} label="Organization Name" value={orgName} onChange={setOrgName} placeholder="e.g. Health First NGO" />
              <Field icon={MapPin} label="Region" value={region} onChange={setRegion} placeholder="e.g. Rural Maharashtra" />
              <div className="sm:col-span-2">
                <Field icon={Mail} label="Contact Info" value={contactInfo} onChange={setContactInfo} placeholder="Additional contact details" />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="text-sm font-medium text-muted-foreground">Account Type</label>
              <div className="flex gap-2">
                {["user", "ngo"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
                      role === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r === "ngo" ? "NGO" : "User"}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Profile
            </button>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-10 text-center">
                <History className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-medium text-foreground">No symptom checks yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Start a health check to see your history here.</p>
                <button onClick={() => navigate("/")} className="mt-4 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
                  Start Health Check
                </button>
              </div>
            ) : (
              history.map((check) => (
                <div key={check.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{check.diagnosis}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(check.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {check.symptoms.map((s, i) => (
                          <span key={i} className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${severityColor(check.severity)}`}>
                        {check.severity}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">{check.confidence}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground">Account Settings</h2>

            <button
              onClick={handleChangePassword}
              className="flex w-full items-center gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:bg-muted/50"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Change Password</p>
                <p className="text-xs text-muted-foreground">We'll send a reset link to your email</p>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-left transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">Log Out</p>
                <p className="text-xs text-muted-foreground">Sign out of your account</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  icon: any;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) => (
  <div>
    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
    />
  </div>
);

export default Profile;
