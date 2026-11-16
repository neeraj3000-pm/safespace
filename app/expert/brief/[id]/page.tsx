import { store } from "@/lib/store";
import { getExperts } from "@/data/experts";
import { SWITCH_THIRD, type SwitchReason } from "@/lib/taxonomy";
import { BriefView } from "./BriefView";
import { LocalBrief } from "./LocalBrief";

export const dynamic = "force-dynamic";
export const metadata = { title: "Expert view (demo) · Next Step" };

export default async function ExpertBrief({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await store.getBrief(id);
  if (!b) return <LocalBrief id={id} />; // demo fallback when running without a shared database
  const expert = getExperts().find((e) => e.id === b.expert_id);
  return (
    <BriefView
      expertName={expert?.name ?? "Expert"}
      lines={b.lines}
      slot={b.slot}
      intro={b.intro}
      switchLabel={b.switch_reason ? SWITCH_THIRD[b.switch_reason as SwitchReason] : undefined}
      edited={b.edited}
      createdAt={b.created_at}
    />
  );
}
