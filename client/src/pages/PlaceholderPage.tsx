import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} />
      <SectionCard
        title="Coming soon"
        description="This route is wired into the app shell; content will be implemented next."
      />
    </div>
  );
}
