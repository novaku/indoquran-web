interface ErrorMessageProps {
  message: string;
  retry?: () => void;
}

export const ErrorMessage = ({ message, retry }: ErrorMessageProps) => {
  return (
    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
      <p className="text-red-700 mb-2">{message}</p>
      {retry && (
        <button 
          onClick={retry}
          className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
};