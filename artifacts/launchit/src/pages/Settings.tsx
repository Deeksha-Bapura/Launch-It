import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Bell, Shield, Trash2, KeyRound } from "lucide-react";

const BASE = "https://launch-it-cnhy.onrender.com/api";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? "bg-primary" : "bg-muted-foreground/30"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const getNotifPref = (key: string, def: boolean) => {
    try {
      const v = localStorage.getItem(`launchit_notif_${user?.id}_${key}`);
      return v === null ? def : v === "true";
    } catch {
      return def;
    }
  };

  const setNotifPref = (key: string, value: boolean) => {
    localStorage.setItem(`launchit_notif_${user?.id}_${key}`, String(value));
  };

  const [weeklyTips, setWeeklyTips] = useState(() => getNotifPref("weekly_tips", true));
  const [deadlineAlerts, setDeadlineAlerts] = useState(() => getNotifPref("deadline_alerts", true));

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleToggleWeeklyTips = (v: boolean) => {
    setWeeklyTips(v);
    setNotifPref("weekly_tips", v);
  };

  const handleToggleDeadlineAlerts = (v: boolean) => {
    setDeadlineAlerts(v);
    setNotifPref("deadline_alerts", v);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (newPw.length < 6) {
      toast({ title: "New password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch(`${BASE}/auth/change-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to change password");
      toast({ title: "Password changed successfully!" });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setShowChangePassword(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setPwSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== "DELETE") return;
    setDeleting(true);
    try {
      const res = await fetch(`${BASE}/auth/user`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete account");
      await logout();
      setLocation("/");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your notification preferences and account security.</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-foreground">Weekly Business Tips</p>
                <p className="text-xs text-muted-foreground">Get weekly tips to grow your business</p>
              </div>
              <Toggle value={weeklyTips} onChange={handleToggleWeeklyTips} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-foreground">Deadline Alerts</p>
                <p className="text-xs text-muted-foreground">Get reminded of upcoming compliance deadlines</p>
              </div>
              <Toggle value={deadlineAlerts} onChange={handleToggleDeadlineAlerts} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Account & Security
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">Change Password</p>
                  <p className="text-xs text-muted-foreground">Update your account password</p>
                </div>
                <button
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  {showChangePassword ? "Cancel" : "Change"}
                </button>
              </div>
              {showChangePassword && (
                <form onSubmit={handleChangePassword} className="mt-4 space-y-3 p-4 bg-muted/30 rounded-xl border border-border">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Current Password</label>
                    <input
                      type="password"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      required
                      className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">New Password</label>
                    <input
                      type="password"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      required
                      minLength={6}
                      className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      required
                      minLength={6}
                      className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={pwSaving}
                    className="w-full bg-primary text-white font-bold py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {pwSaving ? "Saving..." : "Update Password"}
                  </button>
                </form>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-red-600">Delete Account</p>
                  <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-xl">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Delete Account</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete your account, all transactions, documents, and conversations. This cannot be undone.
            </p>
            <p className="text-sm font-medium text-foreground mb-2">
              Type <span className="font-bold text-red-600">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="Type DELETE here"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteText(""); }}
                className="flex-1 py-2 border border-border rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteText !== "DELETE" || deleting}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
