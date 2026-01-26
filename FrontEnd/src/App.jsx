import { useState, useEffect, lazy, Suspense } from 'react'

import RootLayout from './root/RootLayout';

import { Routes, Route } from 'react-router-dom';

import { validateEnv } from './utils/env.util';
import Loader from './Components/Loader';

// Lazy load route components for code splitting
const LeftBottomChat = lazy(() => import('./root/Pages/Left side/LeftBottomChat'));
const LeftBottomGroup = lazy(() => import('./root/Pages/Left side/LeftGroupChat/LeftBottomGroup'));


function App() {

  useEffect(() => {
    try {
      validateEnv();
    } catch (error) {
      console.error('Failed to start app:', error);
    }
  }, []);

  return (
    <main className="w-screen h-screen">
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route path="/" element={<LeftBottomChat />} />
            <Route path="/group" element={<LeftBottomGroup />} />
          </Route>
        </Routes>
      </Suspense>
    </main>
  );
}

export default App;
