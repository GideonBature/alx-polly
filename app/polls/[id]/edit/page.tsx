import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import EditPollForm from "@/app/polls/[id]/edit/EditPollForm";

export default async function EditPollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const { data: poll, error } = await supabase
    .from("polls")
    .select("id, question, owner, poll_options(id, label, idx)")
    .eq("id", id)
    .single();

  if (error || !poll) return notFound();
  if (poll.owner !== user.id) return notFound();

  // Order options by idx ascending for display
  const options = (poll.poll_options || []).sort((a: any, b: any) => a.idx - b.idx);

  return (
    <div className="mx-auto max-w-2xl w-full">
      <EditPollForm
        pollId={poll.id}
        initialQuestion={poll.question}
        initialOptions={options.map((o: any) => ({ id: o.id, label: o.label }))}
      />
    </div>
  );
}
