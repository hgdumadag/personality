import React from 'react';
import { createRoot } from 'react-dom/client';
import PersonalityAssessment from './PersonalityAssessment.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PersonalityAssessment />
  </React.StrictMode>
);
