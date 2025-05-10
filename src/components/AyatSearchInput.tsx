import { useState, FormEvent } from 'react';

interface AyatSearchInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (event: FormEvent) => void;
  placeholder?: string;
  isDisabled?: boolean;
}

const AyatSearchInput = ({
  value,
  onChange,
  onSearch,
  placeholder = "Cari ayat...",
  isDisabled = false
}: AyatSearchInputProps) => {
  return (
    <div className="w-full">
      <form onSubmit={onSearch} className="flex w-full">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          minLength={3}
          disabled={isDisabled}
          required
        />
        <button 
          type="submit"
          className={`px-4 py-2 rounded-r-md text-white transition ${
            isDisabled || value.trim().length < 3 
              ? 'bg-amber-300 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-600'
          }`}
          disabled={isDisabled || value.trim().length < 3}
        >
          Cari
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-1">
        Minimal 3 karakter untuk pencarian. Kata yang dipisahkan spasi akan dicari sebagai AND condition. 
        Contoh: "ampunan rahmat" akan mencari ayat yang mengandung kata "ampunan" DAN "rahmat"
      </p>
    </div>
  );
};

export default AyatSearchInput;
