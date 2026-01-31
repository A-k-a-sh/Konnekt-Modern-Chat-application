import './index.css'
import App from './App.jsx'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AllContext from './Context/AllContext.jsx';
import { NotificationProvider } from './Context/NotificationContext.jsx';
import ErrorBoundary from './Components/ErrorBoundary';
import { ToastProvider } from './Components/Toast';

ReactDOM.createRoot(root).render(
  <ErrorBoundary>
    <BrowserRouter>
      <ToastProvider>
        <AllContext>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AllContext>
      </ToastProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
