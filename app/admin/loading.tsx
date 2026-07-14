import { AppShell } from "@/app/components/AppShell";
import { PageSkeleton } from "@/app/components/PageSkeleton";

export default function Loading() {
  return (
    <AppShell>
      <PageSkeleton />
    </AppShell>
  );
}
