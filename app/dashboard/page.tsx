// app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { format, isPast, isToday } from 'date-fns';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Fetch dashboard data
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .limit(4)
    .order('created_at', { ascending: false });
    
  const { data: deals } = await supabase
    .from('deals')
    .select('*, contacts(first_name, last_name)')
    .limit(5)
    .order('created_at', { ascending: false });
    
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('completed', false)
    .limit(5)
    .order('due_date', { ascending: true });
  
  // Get counts for stats
  const { count: contactsCount } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true });
    
  const { count: dealsCount } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true });
    
  const { count: tasksCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('completed', false);
    
  // Calculate deal value
  const { data: dealValues } = await supabase
    .from('deals')
    .select('value, currency, stage')
    .in('stage', ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won']);
    
  const totalDealValue = dealValues?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0;
  
  // Format stage display
  const formatStage = (stage: string): string => {
    return stage
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Contacts stat */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">
                      Total Contacts
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-slate-900">{contactsCount || 0}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/contacts" className="font-medium text-primary-600 hover:text-primary-500">
                  View all
                </Link>
              </div>
            </div>
          </div>

          {/* Deals stat */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-emerald-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">
                      Active Deals
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-slate-900">{dealsCount || 0}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/deals" className="font-medium text-primary-600 hover:text-primary-500">
                  View all
                </Link>
              </div>
            </div>
          </div>

          {/* Tasks stat */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">
                      Pending Tasks
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-slate-900">{tasksCount || 0}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/tasks" className="font-medium text-primary-600 hover:text-primary-500">
                  View all
                </Link>
              </div>
            </div>
          </div>

          {/* Deal value stat */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-violet-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">
                      Total Deal Value
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-slate-900">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0,
                        }).format(totalDealValue)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/deals" className="font-medium text-primary-600 hover:text-primary-500">
                  View details
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick actions */}
        <div className="mt-6">
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/contacts/new" className="btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              New Contact
            </Link>
            <Link href="/dashboard/deals/new" className="btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              New Deal
            </Link>
            <Link href="/dashboard/tasks/new" className="btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              New Task
            </Link>
          </div>
        </div>
        
        {/* Two column layout for recent items */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent contacts with card design */}
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h2 className="text-lg font-medium text-slate-900">Recent Contacts</h2>
              <Link href="/dashboard/contacts" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </div>
            <div className="bg-white overflow-hidden">
              {contacts && contacts.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                  {contacts.map((contact) => (
                    <li key={contact.id}>
                      <Link href={`/dashboard/contacts/${contact.id}`} className="block hover:bg-slate-50">
                        <div className="px-6 py-4 flex items-center">
                          <div className="min-w-0 flex-1 flex items-center">
                            <div className="flex-shrink-0">
                              <span className="inline-flex h-10 w-10 rounded-full bg-primary-100 text-primary-600 items-center justify-center">
                                {contact.first_name?.[0]}{contact.last_name?.[0]}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 px-4">
                              <div>
                                <p className="text-sm font-medium text-slate-900 truncate">
                                  {contact.first_name} {contact.last_name}
                                </p>
                                <p className="mt-1 text-sm text-slate-500 truncate">
                                  {contact.email || contact.phone || contact.company || 'No additional info'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              contact.status === 'lead' ? 'bg-amber-100 text-amber-800' : 
                              contact.status === 'customer' ? 'bg-emerald-100 text-emerald-800' : 
                              'bg-primary-100 text-primary-800'
                            }`}>
                              {contact.status}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 px-4">
                  <svg className="mx-auto h-12 w-12 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-slate-900">No contacts</h3>
                  <p className="mt-1 text-sm text-slate-500">Get started by creating a new contact.</p>
                  <div className="mt-6">
                    <Link href="/dashboard/contacts/new" className="btn-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      New Contact
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent deals with card design */}
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h2 className="text-lg font-medium text-slate-900">Active Deals</h2>
              <Link href="/dashboard/deals" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </div>
            <div className="bg-white overflow-hidden">
              {deals && deals.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                  {deals.map((deal) => (
                    <li key={deal.id}>
                      <Link href={`/dashboard/deals/${deal.id}`} className="block hover:bg-slate-50">
                        <div className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <span className={`inline-flex h-10 w-10 rounded-full items-center justify-center ${
                                    deal.stage === 'closed_won' ? 'bg-emerald-100 text-emerald-600' : 
                                    deal.stage === 'closed_lost' ? 'bg-rose-100 text-rose-600' : 
                                    'bg-primary-100 text-primary-600'
                                  }`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900 truncate">
                                    {deal.name}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500 truncate">
                                    {deal.contacts ? `${deal.contacts.first_name} ${deal.contacts.last_name}` : 'No contact'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="text-sm font-medium text-slate-900">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: deal.currency || 'USD',
                                }).format(deal.value || 0)}
                              </div>
                              <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                deal.stage === 'closed_won' ? 'bg-emerald-100 text-emerald-800' : 
                                deal.stage === 'closed_lost' ? 'bg-rose-100 text-rose-800' : 
                                'bg-primary-100 text-primary-800'
                              }`}>
                                {formatStage(deal.stage)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 px-4">
                  <svg className="mx-auto h-12 w-12 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-slate-900">No deals</h3>
                  <p className="mt-1 text-sm text-slate-500">Get started by creating a new deal.</p>
                  <div className="mt-6">
                    <Link href="/dashboard/deals/new" className="btn-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      New Deal
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Upcoming tasks */}
          <div className="card lg:col-span-2">
            <div className="card-header flex justify-between items-center">
              <h2 className="text-lg font-medium text-slate-900">Upcoming Tasks</h2>
              <Link href="/dashboard/tasks" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </div>
            <div className="bg-white overflow-hidden">
              {tasks && tasks.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                  {tasks.map((task) => {
                    const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
                    const isDueToday = task.due_date && isToday(new Date(task.due_date));
                    
                    return (
                      <li key={task.id}>
                        <Link href={`/dashboard/tasks/${task.id}`} className="block hover:bg-slate-50">
                          <div className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <span className={`inline-flex h-8 w-8 rounded-full items-center justify-center ${
                                  isOverdue ? 'bg-rose-100 text-rose-600' : 
                                  isDueToday ? 'bg-amber-100 text-amber-600' : 
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 px-4">
                                <div>
                                  <p className="text-sm font-medium text-slate-900 truncate">
                                    {task.title}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-500 truncate">
                                    {task.description || 'No description'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                {task.due_date && (
                                  <time className={`text-sm ${
                                    isOverdue ? 'text-rose-600 font-medium' : 
                                    isDueToday ? 'text-amber-600 font-medium' : 
                                    'text-slate-500'
                                  }`}>
                                    {isOverdue ? 'Overdue' : isDueToday ? 'Today' : format(new Date(task.due_date), 'MMM d, yyyy')}
                                  </time>
                                )}
                                <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                  task.priority === 'high' ? 'bg-rose-100 text-rose-800' : 
                                  task.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 
                                  'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-center py-6 px-4">
                  <svg className="mx-auto h-12 w-12 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-slate-900">No tasks</h3>
                  <p className="mt-1 text-sm text-slate-500">Get started by creating a new task.</p>
                  <div className="mt-6">
                    <Link href="/dashboard/tasks/new" className="btn-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      New Task
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}