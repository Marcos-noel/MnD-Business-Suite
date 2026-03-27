export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="surface noise rounded-2xl px-4 py-3 shadow-glass">
        <div className="h-4 w-40 rounded-xl bg-[color-mix(in_oklab,hsl(var(--c-text))_10%,transparent)]" />
        <div className="mt-2 h-3 w-72 max-w-full rounded-xl bg-[color-mix(in_oklab,hsl(var(--c-text))_10%,transparent)]" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="surface noise rounded-2xl p-5 shadow-glass">
            <div className="h-3 w-24 rounded-xl bg-[color-mix(in_oklab,hsl(var(--c-text))_10%,transparent)]" />
            <div className="mt-3 h-8 w-16 rounded-xl bg-[color-mix(in_oklab,hsl(var(--c-text))_10%,transparent)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
