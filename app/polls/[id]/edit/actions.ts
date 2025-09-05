"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function updatePoll(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const pollId = String(formData.get("pollId"))
  const question = String(formData.get("question") ?? "").trim()
  const optionIds = formData.getAll("optionIds").map((v) => String(v))
  const optionLabels = formData.getAll("optionLabels").map((v) => String(v).trim())

  if (!pollId) throw new Error("Missing poll id")
  if (question.length < 5) throw new Error("Question too short")
  if (optionLabels.length < 2) throw new Error("At least two options required")

  // Verify ownership
  const { data: poll, error: pollErr } = await supabase
    .from("polls")
    .select("id, owner")
    .eq("id", pollId)
    .single()

  if (pollErr || !poll || poll.owner !== user.id) {
    throw new Error("Not found")
  }

/**
 * updatePoll(formData)
 * What: Validates edits, verifies poll ownership, and updates the poll and its options.
 * Why: Server-side enforcement prevents unauthorized edits. We diff existing vs submitted options to
 * avoid destructive replacements and to preserve stable IDs; `idx` maintains display order.
 */
  // Update question
  const { error: upErr } = await supabase
    .from("polls")
    .update({ question })
    .eq("id", pollId)

  if (upErr) throw upErr

  // Fetch existing options
  const { data: existingOpts, error: exErr } = await supabase
    .from("poll_options")
    .select("id, idx, label")
    .eq("poll_id", pollId)

  if (exErr) throw exErr

  const byId = new Map((existingOpts ?? []).map((o) => [o.id, o]))

  // Build desired options with sequential idx
  const desired = optionLabels
    .map((label, i) => ({ id: optionIds[i] || "", label, idx: i }))
    .filter((o) => o.label.length > 0)

  // Upsert updates/inserts
  for (const d of desired) {
    if (d.id && byId.has(d.id)) {
      const { error } = await supabase
        .from("poll_options")
        .update({ label: d.label, idx: d.idx })
        .eq("id", d.id)
        .eq("poll_id", pollId)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from("poll_options")
        .insert({ poll_id: pollId, label: d.label, idx: d.idx })
      if (error) throw error
    }
  }

  // Delete removed options
  const desiredIds = new Set(desired.map((d) => d.id).filter(Boolean))
  for (const o of existingOpts ?? []) {
    if (!desiredIds.has(o.id)) {
      const { error } = await supabase
        .from("poll_options")
        .delete()
        .eq("id", o.id)
        .eq("poll_id", pollId)
      if (error) throw error
    }
  }

  revalidatePath("/polls")
  revalidatePath(`/polls/${pollId}`)
  redirect(`/polls?updated=1`)
}
