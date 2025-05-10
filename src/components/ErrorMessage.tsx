interface ErrorMessageProps {
  message: string;
  retry?: () => void;
  onClearSearchAndRefresh?: () => void;
  additionalInfo?: string; // New prop for additional error information
}

export const ErrorMessage = ({ message, retry, onClearSearchAndRefresh, additionalInfo }: ErrorMessageProps) => {
  const isSearchFailedError = message === "Gagal mencari terjemahan";

  return (
    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
      <p className="text-red-700 mb-2">{message}</p>
      {additionalInfo && (
        <p className="text-red-600 text-sm mb-3">{additionalInfo}</p>
      )}
      {isSearchFailedError && onClearSearchAndRefresh ? (
        <button
          onClick={onClearSearchAndRefresh}
          className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          Kembali ke Daftar Surah
        </button>
      ) : retry ? (
        <button
          onClick={retry}
          className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          Coba Lagi
        </button>
      ) : null}
    </div>
  );
};