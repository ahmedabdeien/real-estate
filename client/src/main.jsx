import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { store } from './store';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: { fontFamily: 'var(--font-family)', direction: 'rtl', maxWidth: 400 },
          success: { iconTheme: { primary: '#15803D', secondary: '#fff' } },
          error: { iconTheme: { primary: '#B91C1C', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  </Provider>
);
