export type Contact = {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    company?: string;
    job_title?: string;
    status: 'lead' | 'prospect' | 'customer' | 'inactive';
    notes?: string;
    created_at: string;
    updated_at: string;
  };
  
  export type Deal = {
    id: string;
    user_id: string;
    contact_id?: string;
    name: string;
    value?: number;
    currency: string;
    stage: 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
    expected_close_date?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
  };
  
  export type Task = {
    id: string;
    user_id: string;
    contact_id?: string;
    deal_id?: string;
    title: string;
    description?: string;
    due_date?: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    updated_at: string;
  };