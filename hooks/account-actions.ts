"use server";

import { createActionClient } from "@/lib/supabase/action";
import { revalidatePath } from "next/cache";

export async function updateAccount(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const name = formData.get("name");

  if (typeof name !== "string" || !name.trim()) {
    return {
      success: false,
      error: "Name is required.",
    };
  }

  const supabase = await createActionClient();
  const { error } = await supabase.auth.updateUser({
    data: { name: name.trim() },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/dashboard/account");

  return {
    success: true,
  };
}

export async function deleteAccount(): Promise<{ error?: string } | void> {
  const supabase = await createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No user found" };

  const { error } = await supabase.rpc("delete_user");

  if (error) {
    return {
      error: error.message,
    };
  }

  await supabase.auth.signOut();
}
