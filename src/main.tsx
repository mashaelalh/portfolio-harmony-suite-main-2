import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root'); // Assuming you have a root element with id="root" in your index.html

if (!rootElement) {
  throw new Error('Failed to find the root element. Make sure you have a root element with id="root" in your index.html.');
}

const root = createRoot(rootElement);
const queryClient = new QueryClient(); // Moved queryClient initialization here

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
import './index.css';
import './styles/frappe-gantt.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Removed duplicate queryClient declaration

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key missing from environment variables.");
}

// Removed duplicate createRoot call
