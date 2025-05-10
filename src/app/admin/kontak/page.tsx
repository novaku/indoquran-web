'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Contact {
  contact_id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  user_id: string | null;
  status: 'unread' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at: string;
}

interface ContactsResponse {
  contacts: Contact[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export default function AdminContactsPage() {
  const { isAuthenticated, user, loading } = useAuthContext();
  const router = useRouter();
  
  const [contactsData, setContactsData] = useState<ContactsResponse | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch contacts data
  useEffect(() => {
    if (!loading) {
      // Check if user is an admin
      if (!isAuthenticated || !user || user.role !== 'admin') {
        router.push('/');
        return;
      }
      
      fetchContacts();
    }
  }, [isAuthenticated, user, loading, page, router]);
  
  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/contact?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      setContactsData(data);
    } catch (err) {
      setError('Error loading contacts. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateContactStatus = async (id: number, status: 'unread' | 'read' | 'replied' | 'archived') => {
    try {
      const response = await fetch(`/api/contact/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update contact status');
      }
      
      // Update the local state
      fetchContacts();
    } catch (err) {
      console.error('Error updating contact status:', err);
      alert('Failed to update contact status');
    }
  };
  
  // Admin UI helpers
  const getStatusBadge = (status: string) => {
    const badges = {
      unread: 'bg-amber-100 text-amber-800',
      read: 'bg-blue-100 text-blue-800',
      replied: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    
    return badges[status as keyof typeof badges] || badges.unread;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy, HH:mm', { locale: id });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null; // Will redirect in useEffect
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-amber-800 mb-6">Pesan Kontak</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : contactsData?.contacts && contactsData.contacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-amber-50 text-amber-800">
                <tr>
                  <th className="px-4 py-3 text-left">Nama</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Subjek</th>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contactsData.contacts.map((contact) => (
                  <tr key={contact.contact_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{contact.name}</td>
                    <td className="px-4 py-3 text-gray-600">{contact.email}</td>
                    <td className="px-4 py-3">
                      {contact.subject.length > 30 
                        ? `${contact.subject.substring(0, 30)}...` 
                        : contact.subject
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(contact.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(contact.status)}`}>
                        {contact.status === 'unread' && 'Belum Dibaca'}
                        {contact.status === 'read' && 'Sudah Dibaca'}
                        {contact.status === 'replied' && 'Dibalas'}
                        {contact.status === 'archived' && 'Diarsipkan'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedContact(contact)}
                        className="text-amber-600 hover:text-amber-800 mr-2"
                      >
                        Lihat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {contactsData.totalPages > 1 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      page === 1 ? 'text-gray-300 bg-gray-50' : 'text-amber-700 bg-white hover:bg-amber-50'
                    }`}
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(p + 1, contactsData.totalPages))}
                    disabled={page === contactsData.totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      page === contactsData.totalPages ? 'text-gray-300 bg-gray-50' : 'text-amber-700 bg-white hover:bg-amber-50'
                    }`}
                  >
                    Selanjutnya
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Menampilkan <span className="font-medium">{(page - 1) * 10 + 1}</span> sampai{' '}
                      <span className="font-medium">
                        {Math.min(page * 10, contactsData.totalCount)}
                      </span>{' '}
                      dari <span className="font-medium">{contactsData.totalCount}</span> hasil
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      {Array.from({ length: contactsData.totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            p === page
                              ? 'z-10 bg-amber-50 border-amber-500 text-amber-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Tidak ada pesan kontak yang ditemukan.
          </div>
        )}
      </div>
      
      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-amber-800">Detail Pesan</h3>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nama</p>
                  <p className="font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium">{selectedContact.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tanggal</p>
                  <p>{formatDate(selectedContact.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedContact.status)}`}>
                    {selectedContact.status === 'unread' && 'Belum Dibaca'}
                    {selectedContact.status === 'read' && 'Sudah Dibaca'}
                    {selectedContact.status === 'replied' && 'Dibalas'}
                    {selectedContact.status === 'archived' && 'Diarsipkan'}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Subjek</p>
                <p className="font-medium">{selectedContact.subject}</p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Pesan</p>
                <div className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                  {selectedContact.message}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => updateContactStatus(selectedContact.contact_id, 'read')}
                  disabled={selectedContact.status === 'read'}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedContact.status === 'read' 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Tandai Sudah Dibaca
                </button>
                <button
                  onClick={() => updateContactStatus(selectedContact.contact_id, 'replied')}
                  disabled={selectedContact.status === 'replied'}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedContact.status === 'replied' 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  Tandai Sudah Dibalas
                </button>
                <button
                  onClick={() => updateContactStatus(selectedContact.contact_id, 'archived')}
                  disabled={selectedContact.status === 'archived'}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedContact.status === 'archived' 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Arsipkan
                </button>
              </div>
            </div>
            
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  const mailtoLink = `mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}&body=Terima kasih telah menghubungi IndoQuran.\n\n`;
                  window.open(mailtoLink);
                  updateContactStatus(selectedContact.contact_id, 'replied');
                }}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Balas Email
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
