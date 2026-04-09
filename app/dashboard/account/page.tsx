import { createClient } from "@/lib/supabase/server";
import { AccountClient } from "./account-client";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const name: string = user?.user_metadata?.name ?? "Unknown";
  const email: string = user?.email ?? "";
  const roles: string[] = user?.user_metadata?.roles ?? [];
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AccountClient
      name={name}
      email={email}
      roles={roles}
      userId={user?.id ?? "—"}
      createdAt={createdAt}
      initials={initials}
    />
  );
}