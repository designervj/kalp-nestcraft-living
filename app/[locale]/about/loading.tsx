export default function Loading() {
  return (
    <div className="w-full animate-pulse px-[5%] py-12 max-w-5xl mx-auto">
      <div className="h-4 w-20 bg-border rounded-full mb-12" />
      <div className="space-y-6 mb-12">
        <div className="h-12 w-2/3 bg-border rounded-2xl" />
        <div className="h-4 w-1/3 bg-border rounded-full" />
      </div>
      <div className="aspect-[21/9] bg-border/40 rounded-3xl mb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`h-3 bg-border rounded ${i === 4 ? "w-3/4" : i === 2 ? "w-5/6" : "w-full"}`} />
        ))}
      </div>
      <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}.animate-shimmer{animation:shimmer 2s infinite}`}</style>
    </div>
  );
}
