export default function Loading() {
  return (
    <div className="w-full animate-pulse px-[5%] py-12 max-w-6xl mx-auto">
      <div className="h-4 w-20 bg-border rounded-full mb-12" />
      <div className="space-y-6 mb-14">
        <div className="h-10 w-56 bg-border rounded-2xl" />
        <div className="h-4 w-96 bg-border rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-3xl p-6 space-y-4">
            <div className="h-12 w-12 bg-border/40 rounded-2xl" />
            <div className="h-5 w-3/4 bg-border rounded-lg" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-border/60 rounded" />
              <div className="h-3 w-11/12 bg-border/60 rounded" />
              <div className="h-3 w-4/5 bg-border/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
