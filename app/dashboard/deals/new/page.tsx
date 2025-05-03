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

interface DealFormData {
  name: string;
  contact_id: string;
  value: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expected_close_date: string;
  notes: string;
}

export default function NewDealPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [formData, setFormData] = useState<DealFormData>({
    name: '',
    contact_id: '',
    value: '',
    currency: 'USD',
    stage: 'lead',
    probability: 0,
    expected_close_date: '',
    notes: '',
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch contacts for dropdown
  useEffect(() => {
    const fetchContacts = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, company')
        .order('last_name', { ascending: true });
      
      if (!error && data) {
        setContacts(data);
      }
    };
    
    fetchContacts();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate form
    if (!formData.name) {
      setError("Deal name is required");
      setLoading(false);
      return;
    }
    
    const supabase = createClient();
    
    const { error: supabaseError } = await supabase
      .from('deals')
      .insert([formData]);
    
    if (supabaseError) {
      setError(supabaseError.message);
      setLoading(false);
      return;
    }
    
    router.refresh();
    router.push('/dashboard/deals');
  };
  
  // Calculate suggested probability based on stage
  const suggestProbability = (stage: DealFormData['stage']): number => {
    const probabilities: Record<DealFormData['stage'], number> = {
      'lead': 10,
      'qualified': 30,
      'proposal': 50,
      'negotiation': 70,
      'closed_won': 100,
      'closed_lost': 0
    };
    
    return probabilities[stage];
  };
  
  // Update probability when stage changes
  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const stage = e.target.value as DealFormData['stage'];
    const probability = suggestProbability(stage);
    
    setFormData(prev => ({
      ...prev,
      stage,
      probability
    }));
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Modern App Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard/deals" className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">Create New Deal</h1>
            </div>
            <div>
              <Link
                href="/dashboard/deals"
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
          {/* Deal Details Section */}
          <div className="space-y-6 pt-8 sm:pt-10">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Deal Details</h3>
              <p className="mt-1 text-sm text-gray-500">Basic information about this opportunity.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Deal Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g. Product X License Renewal"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-4">
                <label htmlFor="contact_id" className="block text-sm font-medium text-gray-700">
                  Associated Contact
                </label>
                <div className="mt-1">
                  <select
                    id="contact_id"
                    name="contact_id"
                    value={formData.contact_id}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    aria-label="Select a contact"
                  >
                    <option value="">-- Select a Contact --</option>
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
                <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                  Deal Value
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {formData.currency === 'USD' ? '$' : 
                       formData.currency === 'EUR' ? '€' : 
                       formData.currency === 'GBP' ? '£' : ''}
                    </span>
                  </div>
                  <input
                    type="number"
                    name="value"
                    id="value"
                    min="0"
                    step="0.01"
                    value={formData.value}
                    onChange={handleChange}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <label htmlFor="currency" className="sr-only">Currency</label>
                    <select
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                      aria-label="Select currency"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="expected_close_date" className="block text-sm font-medium text-gray-700">
                  Expected Close Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="expected_close_date"
                    id="expected_close_date"
                    value={formData.expected_close_date}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Deal Stage Section */}
          <div className="space-y-6 pt-8 sm:pt-10">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Deal Stage</h3>
              <p className="mt-1 text-sm text-gray-500">Current status and likelihood of closing.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="stage" className="block text-sm font-medium text-gray-700">
                  Stage
                </label>
                <div className="mt-1">
                  <select
                    id="stage"
                    name="stage"
                    value={formData.stage}
                    onChange={handleStageChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    aria-label="Select deal stage"
                  >
                    <option value="lead">Lead</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="probability" className="block text-sm font-medium text-gray-700">
                  Probability (%)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="probability"
                    id="probability"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Suggested value based on stage: {formData.probability}%
                </p>
              </div>
            </div>
          </div>
          
          {/* Notes Section */}
          <div className="space-y-6 pt-8 sm:pt-10">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Additional Notes</h3>
              <p className="mt-1 text-sm text-gray-500">Any relevant details about this opportunity.</p>
            </div>
            
            <div>
              <div className="mt-1">
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Add background information, customer needs, or competitive factors..."
                />
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="pt-5">
            <div className="flex justify-end">
              <Link
                href="/dashboard/deals"
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
                  'Save Deal'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}