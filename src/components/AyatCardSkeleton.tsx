export const AyatCardSkeleton = () => {
  return (
    <div className="mb-8 p-6 border border-amber-200 rounded-lg bg-amber-50/30 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 bg-amber-200 rounded-full"></div>
      </div>
      
      <div className="space-y-4">
        <div className="h-12 w-full bg-amber-200 rounded"></div>
        <div className="h-6 w-3/4 bg-amber-200 rounded"></div>
        <div className="h-4 w-full bg-amber-200 rounded"></div>
      </div>
    </div>
  );
};