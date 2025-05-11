import { useState, useEffect } from 'react';

type NoteModalProps = {
  noteToEdit?: {
    content?: string;
    is_public?: boolean;
  };
};

const NoteModal = ({ noteToEdit }: NoteModalProps) => {
  const [noteText, setNoteText] = useState('');
  // Update the initial state of isPublic to be true (public) by default
  const [isPublic, setIsPublic] = useState(true);

  // Update the useEffect that sets the initial state when editing
  useEffect(() => {
    if (noteToEdit) {
      setNoteText(noteToEdit.content || '');
      // Only set isPublic from noteToEdit if it exists, otherwise default to true
      setIsPublic(noteToEdit.is_public ?? true);
    }
  }, [noteToEdit]);

  const isPublicCheckbox = (
    <div className="flex items-center mt-4">
      <input
        type="checkbox"
        id="is-public"
        checked={isPublic}
        onChange={() => setIsPublic(!isPublic)}
        className="mr-2"
      />
      <label htmlFor="is-public" className="text-sm text-gray-700">
        Jadikan catatan ini publik (terlihat oleh pengguna lain)
      </label>
    </div>
  );

  return null; // Replace with your actual component return statement
};

export default NoteModal;