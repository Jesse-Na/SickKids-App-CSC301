import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AuthWrapper from './features/authentication/AuthWrapper';
import { Amplify } from 'aws-amplify';
import { AmplifyConfig } from './amplify';
import { BrowserRouter } from 'react-router-dom';

Amplify.configure(AmplifyConfig);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthWrapper>
        <App />
      </AuthWrapper>
    </BrowserRouter>
  </React.StrictMode>
);
