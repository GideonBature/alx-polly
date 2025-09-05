"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * deletePoll(formData)
 * What: Deletes a poll when requested by its owner.
 * Why: Owner check is enforced both here (by scoping delete to owner) and by RLS in the database.
 * Running as a server action keeps credentials server-side and prevents client tampering.
 */
export async function deletePoll(formData: FormData) {
  const pollId = String(formData.get("pollId") || "");
  if (!pollId) throw new Error("Missing pollId");

  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", pollId)
    .eq("owner", user.id);

  if (error) throw error;

  // Ensure the list page reflects deletion immediately for all viewers.
  revalidatePath("/polls");
  redirect("/polls?deleted=1");
}
