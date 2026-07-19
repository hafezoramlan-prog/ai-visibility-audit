import CampaignPipelineModel from "@/components/CampaignPipelineModel";

export const metadata = {
  title: "Campaign pipeline attribution model",
  description:
    "Model projected pipeline contribution by channel mix, budget, and campaign type.",
};

export default function PipelineModelPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 dark:bg-neutral-950 md:py-20">
      <CampaignPipelineModel />
    </main>
  );
}
