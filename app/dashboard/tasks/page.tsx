"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { format, isPast, isToday, addDays, isFuture, isEqual, isTomorrow } from 'date-fns';

// Define types
interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  priority: string;
  contact_id: string | null;
  deal_id: string | null;
  contact_name?: string;
  deal_name?: string;
  created_at: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<{ [key: string]: string }>({});
  const [deals, setDeals] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [view, setView] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Fetch tasks, contacts, and deals data
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      const supabase = createClient();

      // Fetch contacts
      const { data: contactsData } = await supabase
        .from('contacts')
        .select('id, first_name, last_name');

      if (contactsData) {
        const contactsMap: { [key: string]: string } = {};
        contactsData.forEach((contact) => {
          contactsMap[contact.id] = `${contact.first_name} ${contact.last_name}`;
        });
        setContacts(contactsMap);
      }

      // Fetch deals
      const { data: dealsData } = await supabase
        .from('deals')
        .select('id, name');

      if (dealsData) {
        const dealsMap: { [key: string]: string } = {};
        dealsData.forEach((deal) => {
          dealsMap[deal.id] = deal.name;
        });
        setDeals(dealsMap);
      }

      // Fetch tasks
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (tasksData && !error) {
        setTasks(tasksData);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // Handle task completion toggle
  const handleTaskCompletion = async (taskId: string, completed: boolean): Promise<void> => {
    const supabase = createClient();

    await supabase
      .from('tasks')
      .update({ completed: !completed })
      .eq('id', taskId);

    // Update local state
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !completed } : task
      )
    );
  };

  // Filter tasks based on view, search query, and priority
  const getFilteredTasks = (): Task[] => {
    return tasks.filter((task) => {
      // View filter
      let passesViewFilter = true;
      if (view === 'today') {
        passesViewFilter = task.due_date ? isToday(new Date(task.due_date)) : false;
      } else if (view === 'upcoming') {
        passesViewFilter = task.due_date ? 
          (isFuture(new Date(task.due_date)) && !isToday(new Date(task.due_date))) : 
          false;
      } else if (view === 'completed') {
        passesViewFilter = task.completed;
      }

      // Priority filter
      const passesPriorityFilter = priorityFilter === 'all' || task.priority === priorityFilter;

      // Search query filter
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.contact_id && contacts[task.contact_id] && 
          contacts[task.contact_id].toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.deal_id && deals[task.deal_id] && 
          deals[task.deal_id].toLowerCase().includes(searchQuery.toLowerCase()));

      return passesViewFilter && passesPriorityFilter && matchesSearch;
    });
  };

  // Get task groups by due date
  const getTaskGroups = () => {
    const filteredTasks = getFilteredTasks();
    const today = new Date();
    
    const groups: { [key: string]: Task[] } = {
      overdue: [],
      today: [],
      tomorrow: [],
      upcoming: [],
      noDueDate: []
    };

    filteredTasks.forEach(task => {
      if (!task.due_date) {
        groups.noDueDate.push(task);
      } else {
        const dueDate = new Date(task.due_date);
        if (isPast(dueDate) && !isToday(dueDate)) {
          groups.overdue.push(task);
        } else if (isToday(dueDate)) {
          groups.today.push(task);
        } else if (isTomorrow(dueDate)) {
          groups.tomorrow.push(task);
        } else {
          groups.upcoming.push(task);
        }
      }
    });

    return groups;
  };

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority badge for filtering
  const getPriorityBadge = (priority: string): React.ReactNode => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  // Format due date display
  const formatDueDate = (dateString: string): string => {
    const dueDate = new Date(dateString);
    if (isToday(dueDate)) {
      return 'Today';
    } else if (isTomorrow(dueDate)) {
      return 'Tomorrow';
    } else {
      return format(dueDate, 'MMM d, yyyy');
    }
  };

  const taskGroups = getTaskGroups();
  const totalTasks = getFilteredTasks().length;
  const completedTasks = getFilteredTasks().filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <Link 
            href="/dashboard/tasks/new" 
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Task
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Stats */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* View Tabs */}
            <div className="md:col-span-5">
              <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">Select a tab</label>
                <select
                  id="tabs"
                  name="tabs"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={view}
                  onChange={(e) => setView(e.target.value as any)}
                >
                  <option value="all">All Tasks</option>
                  <option value="today">Today</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                      onClick={() => setView('all')}
                      className={`${
                        view === 'all'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      All Tasks
                    </button>
                    <button
                      onClick={() => setView('today')}
                      className={`${
                        view === 'today'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setView('upcoming')}
                      className={`${
                        view === 'upcoming'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Upcoming
                    </button>
                    <button
                      onClick={() => setView('completed')}
                      className={`${
                        view === 'completed'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Completed
                    </button>
                  </nav>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="md:col-span-4">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Tasks</label>
              <input
                type="text"
                id="search"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by task title, description or related records"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Priority Filter */}
            <div className="md:col-span-3">
              <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Priority</label>
              <select
                id="priority-filter"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{totalTasks}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{completedTasks}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{completionRate}%</p>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-8">
          {loading ? (
            <div className="py-12 flex justify-center">
              <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : getFilteredTasks().length === 0 ? (
            <div className="bg-white shadow rounded-lg py-12 px-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">{searchQuery || priorityFilter !== 'all' ? 'Try adjusting your search or filters' : 'Get started by creating a new task'}</p>
              <div className="mt-6">
                <Link
                  href="/dashboard/tasks/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  New Task
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Overdue Tasks */}
              {taskGroups.overdue.length > 0 && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg leading-6 font-medium text-red-700">Overdue</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {taskGroups.overdue.length}
                    </span>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {taskGroups.overdue.map((task) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onComplete={handleTaskCompletion}
                        contactName={task.contact_id ? contacts[task.contact_id] : undefined}
                        dealName={task.deal_id ? deals[task.deal_id] : undefined}
                        getPriorityColor={getPriorityColor}
                      />
                    ))}
                  </ul>
                </div>
              )}

              {/* Today's Tasks */}
              {taskGroups.today.length > 0 && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Today</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {taskGroups.today.length}
                    </span>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {taskGroups.today.map((task) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onComplete={handleTaskCompletion}
                        contactName={task.contact_id ? contacts[task.contact_id] : undefined}
                        dealName={task.deal_id ? deals[task.deal_id] : undefined}
                        getPriorityColor={getPriorityColor}
                      />
                    ))}
                  </ul>
                </div>
              )}

              {/* Tomorrow's Tasks */}
              {taskGroups.tomorrow.length > 0 && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Tomorrow</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {taskGroups.tomorrow.length}
                    </span>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {taskGroups.tomorrow.map((task) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onComplete={handleTaskCompletion}
                        contactName={task.contact_id ? contacts[task.contact_id] : undefined}
                        dealName={task.deal_id ? deals[task.deal_id] : undefined}
                        getPriorityColor={getPriorityColor}
                      />
                    ))}
                  </ul>
                </div>
              )}

              {/* Upcoming Tasks */}
              {taskGroups.upcoming.length > 0 && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {taskGroups.upcoming.length}
                    </span>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {taskGroups.upcoming.map((task) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onComplete={handleTaskCompletion}
                        contactName={task.contact_id ? contacts[task.contact_id] : undefined}
                        dealName={task.deal_id ? deals[task.deal_id] : undefined}
                        getPriorityColor={getPriorityColor}
                      />
                    ))}
                  </ul>
                </div>
              )}

              {/* No Due Date */}
              {taskGroups.noDueDate.length > 0 && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">No Due Date</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {taskGroups.noDueDate.length}
                    </span>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {taskGroups.noDueDate.map((task) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onComplete={handleTaskCompletion}
                        contactName={task.contact_id ? contacts[task.contact_id] : undefined}
                        dealName={task.deal_id ? deals[task.deal_id] : undefined}
                        getPriorityColor={getPriorityColor}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Task Item Component
interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string, completed: boolean) => Promise<void>;
  contactName?: string;
  dealName?: string;
  getPriorityColor: (priority: string) => string;
}

function TaskItem({ task, onComplete, contactName, dealName, getPriorityColor }: TaskItemProps) {
  return (
    <li className={`px-4 py-4 ${task.completed ? 'bg-gray-50' : ''}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 pt-1">
          <button
            onClick={() => onComplete(task.id, task.completed)}
            className={`h-5 w-5 rounded border ${
              task.completed
                ? 'bg-green-500 border-green-500 flex items-center justify-center'
                : 'border-gray-300'
            }`}
            aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {task.completed && (
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
              </svg>
            )}
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium text-gray-900 ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </p>
            <div className="ml-2 flex-shrink-0 flex">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>
          </div>
          {task.description && (
            <p className={`mt-1 text-sm text-gray-500 ${task.completed ? 'line-through' : ''}`}>{task.description}</p>
          )}
          <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
            {task.due_date && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDueDate(task.due_date)}</span>
              </div>
            )}
            {contactName && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{contactName}</span>
              </div>
            )}
            {dealName && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{dealName}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 self-center ml-2">
          <Link href={`/dashboard/tasks/${task.id}`}>
            <span className="font-medium text-indigo-600 hover:text-indigo-900 text-sm">
              View<span className="sr-only">, {task.title}</span>
            </span>
          </Link>
        </div>
      </div>
    </li>
  );
}

function formatDueDate(dateString: string): string {
  const dueDate = new Date(dateString);
  if (isToday(dueDate)) {
    return 'Today';
  } else if (isTomorrow(dueDate)) {
    return 'Tomorrow';
  } else {
    return format(dueDate, 'MMM d, yyyy');
  }
}