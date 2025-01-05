// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage.jsx";
import EditorLayout from "./components/EditorLayout.jsx";
import Toast from './components/Toast';
import useWindowDimensions from "./hooks/useWindowDimensions.jsx";

function App() {
  useWindowDimensions()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/:id" element={<EditorLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </BrowserRouter>
  );
}

export default App;
