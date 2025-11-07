import { useState, useEffect } from 'react'

import RootLayout from './root/RootLayout';

import { Routes, Route } from 'react-router-dom';

import LeftBottomChat from './root/Pages/Left side/LeftBottomChat';

import LeftBottomGroup from './root/Pages/Left side/LeftGroupChat/LeftBottomGroup';



function App() {

  useEffect(() => {
    
  }, );

  return (
    <main className="w-screen h-screen">
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route path="/" element={<LeftBottomChat />} />
          <Route path="/group" element={<LeftBottomGroup />} />
        </Route>
      </Routes>
    </main>
  );
}

export default App;
