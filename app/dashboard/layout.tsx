import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-slate-200 bg-white">
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-slate-200">
          <h1 className="text-xl font-bold text-primary-700">SoloCRM</h1>
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1 bg-white">
            <Link
              href="/dashboard"
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-900 bg-slate-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            <Link
              href="/dashboard/contacts"
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-6 w-6 text-slate-400 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Contacts
            </Link>
            <Link
              href="/dashboard/deals"
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-6 w-6 text-slate-400 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Deals
            </Link>
            <Link
              href="/dashboard/tasks"
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-6 w-6 text-slate-400 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Tasks
            </Link>
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-slate-200 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 truncate">{user.email}</p>
                <form action="/auth/logout" method="post">
                  <button
                    type="submit"
                    className="mt-1 text-xs font-medium text-primary-600 hover:text-primary-500"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 sm:px-6">
        <button
          type="button"
          className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
        >
          <span className="sr-only">Open sidebar</span>
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-primary-700">SoloCRM</h1>
        <div>
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="px-3 py-1 text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
      
      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop header - only visible on larger screens */}
        <header className="hidden lg:block bg-white border-b border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="py-4 flex items-center justify-between">
              <div className="flex-1 flex">
                <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
              </div>
              <div className="ml-4 flex items-center md:ml-6">
                <span className="text-sm text-slate-500 mr-4">{user.email}</span>
                <form action="/auth/logout" method="post">
                  <button
                    type="submit"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-slate-100 pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}