import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  return (
    <Layout>
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 flex-1">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground text-lg">{user?.name} — {user?.email}</p>
      </div>
    </Layout>
  );
}
