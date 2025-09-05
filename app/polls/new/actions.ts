"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createPoll(formData: FormData) {
  const question = String(formData.get("question") || "").trim();
  let options = formData.getAll("options").map((v) => String(v || "").trim());
  options = options.filter((o) => o.length > 0);
/**
 * createPoll(formData)
 * What: Validates inputs and creates a poll with its options under the authenticated user.
 * Why: Server Action keeps credentials on the server and leverages RLS policies that require the
 * `owner` to match `auth.uid()` for inserts. We upsert the profile to ensure FK constraints are met.
 */

  if (question.length < 5 || question.length > 500) {
    throw new Error("Question must be between 5 and 500 characters");
  }
  if (options.length < 2 || options.length > 10) {
    throw new Error("Provide between 2 and 10 options");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error("Not authenticated");

  // Ensure profile exists (first-time login)
  await supabase.from("profiles").upsert({ id: user.id }, { onConflict: "id" });

  const { data: poll, error } = await supabase
    .from("polls")
    .insert({ owner: user.id, question })
    .select("id")
    .single();
  if (error || !poll) throw error || new Error("Failed to create poll");

  const optionRows = options.map((label, idx) => ({ poll_id: poll.id, label, idx }));
  const { error: optErr } = await supabase.from("poll_options").insert(optionRows);
  if (optErr) throw optErr;

  redirect(`/polls?created=1`);
}
