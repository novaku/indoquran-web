import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#f8f4e5] border-t border-[#d3c6a6] py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-[#5D4037] text-sm">
              © {new Date().getFullYear()} IndoQuran - Al-Qur'an Digital Bahasa Indonesia
            </p>
          </div>
          {/* Links moved to the header */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
