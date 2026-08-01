export default function Loading() {
  return (
    <div className="w-full animate-pulse px-[5%] py-12 max-w-5xl mx-auto">
      <div className="h-4 w-20 bg-border rounded-full mb-12" />
      <div className="space-y-6 mb-12">
        <div className="h-10 w-56 bg-border rounded-2xl" />
        <div className="h-4 w-80 bg-border rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="h-64 bg-border/30 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>
          <div className="h-64 bg-border/30 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-6 w-40 bg-border rounded-lg" />
          <div className="h-3 w-full bg-border rounded" />
          <div className="h-3 w-full bg-border rounded" />
          <div className="h-3 w-4/5 bg-border rounded" />
          <div className="h-3 w-3/5 bg-border rounded" />
          <div className="h-3 w-full bg-border rounded" />
          <div className="h-3 w-2/3 bg-border rounded pt-6" />
        </div>
      </div>
      <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}.animate-shimmer{animation:shimmer 2s infinite}`}</style>
    </div>
  );
}
