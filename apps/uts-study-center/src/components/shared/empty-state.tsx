import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-xl border border-dashed bg-muted/20 px-5 text-center">
      <div>
        <Icon aria-hidden="true" className="mx-auto mb-3 size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  );
}
