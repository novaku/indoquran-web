import React from 'react';

// Define the structure for location data
export interface LocationData {
  city: string;
  region: string;
  latitude?: number;
  longitude?: number;
}

// Default location to use when auto-location is not available
export const defaultLocation: LocationData = {
  city: "Jakarta",
  region: "Indonesia",
  latitude: -6.2088,
  longitude: 106.8456
};

interface LocationSettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (useAutoLocation: boolean) => void;
}

const LocationSettingsPopup: React.FC<LocationSettingsPopupProps> = ({
  isOpen,
  onClose,
  onSelectOption,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-amber-800 mb-4">
          Pengaturan Lokasi
        </h2>
        
        <p className="text-gray-600 mb-6">
          Untuk menampilkan jadwal sholat yang akurat, kami memerlukan informasi lokasi Anda. 
          Silakan pilih metode penentuan lokasi:
        </p>

        <div className="space-y-4 mb-6">
          <button
            onClick={() => {
              onSelectOption(true);
              onClose();
            }}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-between group"
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">Gunakan Lokasi Otomatis</span>
              <span className="text-sm text-amber-100">Deteksi lokasi secara otomatis</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-sm text-gray-500">atau</span>
            </div>
          </div>

          <button
            onClick={() => {
              onSelectOption(false);
              onClose();
            }}
            className="w-full bg-white border-2 border-amber-500 text-amber-700 hover:bg-amber-50 py-3 px-4 rounded-lg transition-colors flex items-center justify-between group"
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">Gunakan Lokasi Default</span>
              <span className="text-sm text-amber-700">
                {defaultLocation.city}, {defaultLocation.region}
              </span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Anda dapat mengubah pengaturan ini kapan saja melalui menu pengaturan.
        </p>
      </div>
    </div>
  );
};

export default LocationSettingsPopup;
