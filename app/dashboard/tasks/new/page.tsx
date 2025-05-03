"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

// Define types
interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  company: string | null;
}

interface Deal {
  id: string;
  name: string;
  stage: string;
}

interface TaskFormData {
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  contact_id: string;
  deal_id: string;
  completed: boolean;
}

export default function NewTaskPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    contact_id: '',
    deal_id: '',
    completed: false
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch contacts and deals for dropdowns
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const supabase = createClient();
      
      // Fetch contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, company')
        .order('last_name', { ascending: true });
      
      if (!contactsError && contactsData) {
        setContacts(contactsData);
      }
      
      // Fetch deals
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('id, name, stage')
        .not('stage', 'eq', 'closed_won')
        .not('stage', 'eq', 'closed_lost')
        .order('name', { ascending: true });
      
      if (!dealsError && dealsData) {
        setDeals(dealsData);
      }
    };
    
    fetchData();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate form
    if (!formData.title) {
      setError("Task title is required");
      setLoading(false);
      return;
    }
    
    const supabase = createClient();
    
    const { error: supabaseError } = await supabase
      .from('tasks')
      .insert([formData]);
    
    if (supabaseError) {
      setError(supabaseError.message);
      setLoading(false);
      return;
    }
    
    router.refresh();
    router.push('/dashboard/tasks');
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Modern App Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard/tasks" className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">Create New Task</h1>
            </div>
            <div>
              <Link
                href="/dashboard/tasks"
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 border-l-4 border-red-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
          {/* Task Details Section */}
          <div className="space-y-6 pt-8 sm:pt-10">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Task Details</h3>
              <p className="mt-1 text-sm text-gray-500">Basic information about this task.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g. Schedule follow-up call"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Add details about this task..."
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <div className="mt-1">
                  <input
                    type="datetime-local"
                    name="due_date"
                    id="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <div className="mt-1">
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    aria-label="Select task priority"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Related Records Section */}
          <div className="space-y-6 pt-8 sm:pt-10">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Related Records</h3>
              <p className="mt-1 text-sm text-gray-500">Link this task to a contact or deal.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="contact_id" className="block text-sm font-medium text-gray-700">
                  Related Contact
                </label>
                <div className="mt-1">
                  <select
                    id="contact_id"
                    name="contact_id"
                    value={formData.contact_id}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    aria-label="Select related contact"
                  >
                    <option value="">-- None --</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name} {contact.company ? `(${contact.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 flex justify-end">
                  <Link href="/dashboard/contacts/new" className="text-sm text-indigo-600 hover:text-indigo-500">
                    + Add New Contact
                  </Link>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="deal_id" className="block text-sm font-medium text-gray-700">
                  Related Deal
                </label>
                <div className="mt-1">
                  <select
                    id="deal_id"
                    name="deal_id"
                    value={formData.deal_id}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    aria-label="Select related deal"
                  >
                    <option value="">-- None --</option>
                    {deals.map(deal => (
                      <option key={deal.id} value={deal.id}>
                        {deal.name} ({deal.stage})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 flex justify-end">
                  <Link href="/dashboard/deals/new" className="text-sm text-indigo-600 hover:text-indigo-500">
                    + Add New Deal
                  </Link>
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="completed"
                      name="completed"
                      type="checkbox"
                      checked={formData.completed}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      aria-label="Mark task as completed"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="completed" className="font-medium text-gray-700">Mark as completed</label>
                    <p className="text-gray-500">Task will be created with a completed status.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="pt-5">
            <div className="flex justify-end">
              <Link
                href="/dashboard/tasks"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Task'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}