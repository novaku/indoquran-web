interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const LoadingSpinner = ({ size = 'md', showText = true }: LoadingSpinnerProps) => {
  // Set spinner size based on prop
  const spinnerSize = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }[size];
  
  return (
    <div className="flex justify-center items-center p-4">
      <div className={`animate-spin rounded-full ${spinnerSize} border-b-2 border-amber-700`}></div>
      {showText && <span className="ml-3 text-amber-700">Memuat...</span>}
    </div>
  );
};