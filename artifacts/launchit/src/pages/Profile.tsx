import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User, Building2, Camera, CheckCircle } from "lucide-react";

const BASE = "/api";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia",
  "Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland",
  "Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington",
  "West Virginia","Wisconsin","Wyoming",
];

const BUSINESS_TYPES = ["food","beauty","cleaning","landscaping","retail","tutoring","repair","crafts","general"];

const REGISTRATION_STATUSES = ["Not started","In progress","Registered","Pending renewal"];

export default function Profile() {
  const { user, updateUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [email] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [businessType, setBusinessType] = useState(user?.businessType ?? "");
  const [state, setState] = useState(user?.state ?? "");
  const [registrationStatus, setRegistrationStatus] = useState(user?.registrationStatus ?? "");
  const [yearStarted, setYearStarted] = useState(user?.yearStarted ?? "");
  const [description, setDescription] = useState(user?.description ?? "");
  const [logoUrl, setLogoUrl] = useState(user?.logoUrl ?? "");
  const [logoPreview, setLogoPreview] = useState(user?.logoUrl ?? "");
  const [saving, setSaving] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setLogoPreview(result);
      setLogoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, businessName, businessType, state, registrationStatus, yearStarted, description, logoUrl }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      updateUser(data.user);
      toast({ title: "Profile saved!", description: "Your changes have been saved." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your business identity and personal information.</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="font-bold text-foreground mb-5 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Business Identity
          </h2>
          <div className="flex items-start gap-5 mb-5">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-2xl bg-muted border border-border overflow-hidden cursor-pointer"
                onClick={() => fileRef.current?.click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1"
              >
                <Camera className="w-3 h-3" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Maria's Cakes"
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Business Type</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white capitalize"
              >
                <option value="">Select type</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              >
                <option value="">Select state</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                Registration Status
                {registrationStatus === "Registered" && (
                  <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                    <CheckCircle className="w-3 h-3" /> Registered
                  </span>
                )}
              </label>
              <select
                value={registrationStatus}
                onChange={(e) => setRegistrationStatus(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              >
                <option value="">Select status</option>
                {REGISTRATION_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Year Started</label>
              <input
                type="number"
                value={yearStarted}
                onChange={(e) => setYearStarted(e.target.value)}
                placeholder="e.g. 2022"
                min="1900"
                max={new Date().getFullYear()}
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-foreground">Business Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what your business does..."
              rows={3}
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="font-bold text-foreground mb-5 flex items-center gap-2">
            <User className="w-4 h-4" /> Personal Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 self-start"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </Layout>
  );
}
