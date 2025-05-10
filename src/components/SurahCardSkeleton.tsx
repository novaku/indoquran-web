export const SurahCardSkeleton = () => {
  return (
    <div className="p-4 border border-amber-200 rounded-lg animate-pulse">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-200 rounded-full"></div>
          <div>
            <div className="h-6 w-32 bg-amber-200 rounded mb-2"></div>
            <div className="h-4 w-24 bg-amber-200 rounded"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="h-8 w-16 bg-amber-200 rounded mb-2"></div>
          <div className="h-4 w-20 bg-amber-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};