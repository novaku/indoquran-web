import { query } from '@/utils/db';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string | null;
}

export interface Contact extends ContactFormData {
  contact_id: number;
  status: 'unread' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at: string;
}

export async function saveContactMessage(data: ContactFormData): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const { name, email, subject, message, userId } = data;
    
    const result = await query({
      query: `
        INSERT INTO contacts 
        (name, email, subject, message, user_id)
        VALUES (?, ?, ?, ?, ?)
      `,
      values: [name, email, subject, message, userId || null]
    }) as any;
    
    if (result.insertId) {
      return { success: true, id: result.insertId };
    }
    
    return { success: false, error: 'Failed to save contact message' };
  } catch (error: any) {
    console.error('Error saving contact message:', error);
    return { 
      success: false, 
      error: error.message || 'An error occurred while saving your message' 
    };
  }
}

export async function getContactMessages(page = 1, limit = 10): Promise<{ 
  contacts: Contact[]; 
  totalCount: number; 
  totalPages: number; 
  currentPage: number 
}> {
  try {
    // Get total count
    const countResult = await query({
      query: 'SELECT COUNT(*) as count FROM contacts'
    }) as any[];
    
    const totalCount = countResult[0].count;
    const totalPages = Math.ceil(totalCount / limit);
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get paginated results
    const contacts = await query({
      query: `
        SELECT * FROM contacts
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `,
      values: [limit, offset]
    }) as Contact[];
    
    return {
      contacts,
      totalCount,
      totalPages,
      currentPage: page
    };
  } catch (error) {
    console.error('Error getting contact messages:', error);
    throw error;
  }
}

export async function updateContactStatus(
  contactId: number, 
  status: 'unread' | 'read' | 'replied' | 'archived'
): Promise<boolean> {
  try {
    const result = await query({
      query: 'UPDATE contacts SET status = ? WHERE contact_id = ?',
      values: [status, contactId]
    }) as any;
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error updating contact status:', error);
    throw error;
  }
}
