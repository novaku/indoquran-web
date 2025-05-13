'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const { isAuthenticated, user } = useAuthContext();
  
  // Auto-fill form with user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prevData => ({
        ...prevData,
        name: user.username || '',
        email: user.email || ''
      }));
    }
  }, [isAuthenticated, user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama harus diisi';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subjek harus diisi';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subjek minimal 3 karakter';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Pesan harus diisi';
    } else if (formData.message.trim().length < 3) {
      newErrors.message = 'Pesan minimal 3 karakter';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Character count tracking for required fields with minimum length
  const getCharacterCount = (field: keyof FormState) => {
    const count = formData[field].trim().length;
    return count;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isAuthenticated && user && (
        <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-4">
          <p className="text-sm text-green-700">
            Form telah diisi otomatis dengan data akun Anda. Anda dapat mengubahnya jika diperlukan.
          </p>
        </div>
      )}
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 text-sm text-blue-800">
        <p className="font-medium mb-1">Petunjuk Pengisian Form:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Semua kolom wajib diisi</li>
          <li>Nama harus diisi dengan benar</li>
          <li>Email harus dalam format yang valid (contoh: nama@domain.com)</li>
          <li>Subjek dan pesan minimal mengandung 3 karakter</li>
        </ul>
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          Nama <span className="text-red-500 mx-1">*</span>
          {isAuthenticated && user && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-1 flex items-center">
              <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Diisi otomatis
            </span>
          )}
        </label>
        <div className="relative">
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 pl-10 border ${
              errors.name ? 'border-red-500' : 
              formData.name && formData.name.trim().length > 0 ? 'border-green-500' : 
              'border-gray-300'
            } rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500`}
            placeholder="Nama Anda"
            required
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className={`h-5 w-5 ${formData.name ? 'text-amber-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <svg className="h-4 w-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errors.name}
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          Email <span className="text-red-500 mx-1">*</span>
          {isAuthenticated && user && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-1 flex items-center">
              <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Diisi otomatis
            </span>
          )}
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 pl-10 border ${
              errors.email ? 'border-red-500' : 
              formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'border-green-500' : 
              'border-gray-300'
            } rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500`}
            placeholder="email@contoh.com"
            required
            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className={`h-5 w-5 ${formData.email ? 'text-amber-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <svg className="h-4 w-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errors.email}
          </p>
        )}
        {!errors.email && formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
          <p className="mt-1 text-sm text-green-600 flex items-center">
            <svg className="h-4 w-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Format email valid
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          Subjek <span className="text-xs text-gray-500">(min. 3 karakter)</span>
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${
            errors.subject ? 'border-red-500' : 
            formData.subject && formData.subject.trim().length >= 3 ? 'border-green-500' : 
            'border-gray-300'
          } rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500`}
          placeholder="Subjek pesan"
          required
          minLength={3}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {errors.subject && (
              <p className="text-sm text-red-600 flex items-center">
                <svg className="h-4 w-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errors.subject}
              </p>
            )}
            {!errors.subject && formData.subject && formData.subject.trim().length >= 3 && (
              <p className="text-sm text-green-600 flex items-center">
                <svg className="h-4 w-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Subjek valid
              </p>
            )}
          </div>
          <span className={`text-xs py-1 px-2 rounded ${
            !formData.subject ? 'bg-gray-100 text-gray-500' :
            getCharacterCount('subject') < 3 ? 'bg-red-100 text-red-700' : 
            'bg-green-100 text-green-700'
          }`}>
            {getCharacterCount('subject')}/3 karakter
          </span>
        </div>
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Pesan <span className="text-xs text-gray-500">(min. 3 karakter)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${
            errors.message ? 'border-red-500' : 
            formData.message && formData.message.trim().length >= 3 ? 'border-green-500' : 
            'border-gray-300'
          } rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500`}
          placeholder="Tulis pesan Anda di sini..."
          required
          minLength={3}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {errors.message && (
              <p className="text-sm text-red-600 flex items-center">
                <svg className="h-4 w-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errors.message}
              </p>
            )}
            {!errors.message && formData.message && formData.message.trim().length >= 3 && (
              <p className="text-sm text-green-600 flex items-center">
                <svg className="h-4 w-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Pesan valid
              </p>
            )}
          </div>
          <div className="flex items-center">
            <span className={`text-xs py-1 px-2 rounded ${
              !formData.message ? 'bg-gray-100 text-gray-500' :
              getCharacterCount('message') < 3 ? 'bg-red-100 text-red-700' : 
              'bg-green-100 text-green-700'
            }`}>
              {getCharacterCount('message')}/3 karakter
            </span>
            
            {formData.message && (
              <span className="text-xs text-gray-500 ml-2">
                {formData.message.length} karakter total
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-4 rounded-md hover:from-amber-700 hover:to-amber-800 transition-all transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 shadow-md ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Mengirim...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              <span>Kirim Pesan</span>
            </div>
          )}
        </button>
      </div>
      
      {submitStatus && (
        <div
          className={`p-4 rounded-md ${
            submitStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {submitStatus === 'success' ? (
            isAuthenticated && user 
              ? `Pesan berhasil terkirim menggunakan akun ${user.username}. Terima kasih atas masukan Anda.`
              : 'Pesan berhasil terkirim. Terima kasih atas masukan Anda.'
          ) : (
            'Maaf, terjadi kesalahan saat mengirim pesan. Silakan coba lagi.'
          )}
        </div>
      )}
    </form>
  );
}
