import React from 'react';
import ReactDOM from 'react-dom/client'; // Use "react-dom/client" in React 18
import DataVis from './FileUploadAndDisplay'; // Ensure the path is correct
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <DataVis/>
  </React.StrictMode>
);
