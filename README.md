# SoloCRM - A Simple CRM for Solopreneurs

SoloCRM is a lightweight Customer Relationship Management (CRM) system designed for solopreneurs and small businesses. It helps you manage contacts, track deals, and organize tasks in a clean, intuitive interface.

## Features

- **Contact Management**: Store and organize all your business contacts
- **Deal Tracking**: Monitor sales opportunities from lead to close
- **Task Management**: Stay on top of follow-ups and to-dos
- **Dashboard**: Get a quick overview of your business activity
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [Supabase](https://supabase.com/) - Backend database and authentication
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
   ```bash
   gh repo clone mattgrilli/solopreneur-crm
   cd solopreneur-crm
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the Supabase database
   - Execute the SQL scripts in the `schema.sql` file using the Supabase SQL Editor
   - Run the `mock-data.sql` script to populate your database with sample data

5. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

SoloCRM uses three main tables:

### Contacts

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  status TEXT DEFAULT 'lead',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Deals

```sql
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  value DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  stage TEXT DEFAULT 'lead',
  probability INTEGER DEFAULT 0,
  expected_close_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tasks

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Project Structure

```
solocrm/
├── app/
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard and CRM pages
│   ├── components/     # Reusable UI components
│   ├── utils/          # Utility functions
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── public/             # Static assets
├── styles/             # Global styles
├── schema.sql          # Database schema
└── mock-data.sql       # Sample data for testing
```

## Customization

### Theme Colors

The application uses a customizable color scheme defined in `globals.css`:

```css
:root {
  /* Primary colors */
  --color-primary-50: #f0f9ff;
  --color-primary-100: #e0f2fe;
  --color-primary-200: #b9e6fe;
  --color-primary-300: #7cd4fd;
  --color-primary-400: #36bffa;
  --color-primary-500: #0ca5e9;
  --color-primary-600: #0284c7;
  --color-primary-700: #0369a1;
  --color-primary-800: #075985;
  --color-primary-900: #0c4a6e;
  
  /* Secondary colors */
  --color-secondary-500: #6b7280;
  
  /* Other colors and theme variables */
  --font-sans: 'Inter var', system-ui, sans-serif;
}
```

You can modify these values to match your brand colors.

## Row Level Security

The application uses Supabase Row Level Security (RLS) to ensure that users can only access their own data:

```sql
-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for contacts
CREATE POLICY "Users can only access their own contacts"
  ON contacts
  FOR ALL
  USING (auth.uid() = user_id);
```

Similar policies are applied to deals and tasks tables.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Heroicons](https://heroicons.com/) - SVG icons
- [date-fns](https://date-fns.org/) - Date utility library
