// Add this code to the DoaDetailPopup component or wherever the doa popup is implemented

import { useState } from 'react';

export function DoaDetailPopup({ doa, onClose }: { doa: any, onClose: () => void }) {
  const [comment, setComment] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Function to handle "Amiin" button click
  const handleAmiinClick = () => {
    // Add any amiin functionality here if needed
    
    // Close the popup after clicking Amiin
    onClose();
  };
  
  // Function to handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) return;
    
    try {
      setIsSending(true);
      
      // Add your comment submission logic here
      // For example: await sendComment(doa.id, comment);
      
      // Clear the comment field
      setComment('');
      
      // Close the popup after successfully sending the comment
      onClose();
    } catch (error) {
      console.error('Error sending comment:', error);
      // Handle error (maybe show an error message)
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{doa.title}</h2>
          <button 
            onClick={onClose} // This line ensures the onClose function is called when the button is clicked
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          {/* Doa content */}
          <div className="text-right mb-2 text-2xl leading-loose">{doa.arabic}</div>
          <div className="italic mb-2">{doa.latin}</div>
          <div className="mb-4">{doa.translation}</div>
        </div>
        
        {/* Amiin button */}
        <button
          onClick={handleAmiinClick}
          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-4"
        >
          Aamiin
        </button>
        
        {/* Comment form */}
        <form onSubmit={handleSubmitComment} className="mt-4">
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Komentar
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 min-h-[100px]"
              placeholder="Tulis komentar Anda..."
            />
          </div>
          <button
            type="submit"
            disabled={isSending || !comment.trim()}
            className={`w-full py-2 rounded-lg ${
              isSending || !comment.trim() 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isSending ? 'Mengirim...' : 'Kirim Komentar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Example usage shown below is for reference only and should be implemented in a separate file

/*
// In DoaList.tsx:
/*
import { DoaDetailPopup } from './DoaDetailPopup';

export function DoaList() {
  const [selectedDoa, setSelectedDoa] = useState(null);
  
  // Function to close the popup
  const handleClosePopup = () => {
    setSelectedDoa(null);
  };
  
  return (
    <div>
      {/* Doa list rendering *//*}
      {/* ... *//*}
      
      {/* Popup rendering *//*}
      {selectedDoa && (
        <DoaDetailPopup 
          doa={selectedDoa} 
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}
*/