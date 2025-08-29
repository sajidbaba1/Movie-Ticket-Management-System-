import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Add error handling for the main app startup
try {
  console.log('🚀 Starting MovieHub application...');

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );

  console.log('✅ MovieHub application rendered successfully');
} catch (error) {
  console.error('❌ Failed to start MovieHub application:', error);

  // Fallback UI in case of critical errors
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        font-family: Arial, sans-serif;
        background: #f9fafb;
        color: #374151;
        padding: 20px;
      ">
        <div style="
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 500px;
        ">
          <h1 style="color: #dc2626; margin-bottom: 20px;">⚠️ Application Error</h1>
          <p style="margin-bottom: 20px;">Sorry, there was an error loading the application.</p>
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: #2563eb;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 16px;
            "
          >
            🔄 Reload Page
          </button>
        </div>
      </div>
    `;
  }
}
