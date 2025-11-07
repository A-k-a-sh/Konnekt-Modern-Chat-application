import './index.css'
import App from './App.jsx'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AllContext from './Context/AllContext.jsx';

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <AllContext>
      <App />
    </AllContext>
  </BrowserRouter>
);
