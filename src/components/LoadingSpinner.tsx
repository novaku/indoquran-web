export const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
      <span className="ml-3 text-amber-700">Memuat...</span>
    </div>
  );
};