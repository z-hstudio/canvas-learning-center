import type { ReactNode } from "react";

export function PageHeading({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        {eyebrow ? (
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</div>
        ) : null}
        <h1 className="text-balance text-2xl font-semibold tracking-[-0.025em] sm:text-[28px]">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
