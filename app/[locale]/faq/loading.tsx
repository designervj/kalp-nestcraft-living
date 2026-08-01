export default function Loading() {
  return (
    <div className="w-full animate-pulse px-[5%] py-12 max-w-4xl mx-auto">
      <div className="h-4 w-16 bg-border rounded-full mb-12" />
      <div className="space-y-6 mb-14">
        <div className="h-10 w-48 bg-border rounded-2xl" />
        <div className="h-4 w-96 bg-border rounded-full" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-6 space-y-3">
            <div className="h-5 w-4/5 bg-border rounded-lg" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-border/60 rounded" />
              <div className="h-3 w-11/12 bg-border/60 rounded" />
              <div className="h-3 w-3/4 bg-border/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
