/* src/pages/Login.jsx */
import React, { useState, useEffect } from 'react';
import flagsmith from 'flagsmith';
import InteractiveLogin from './InteractiveLogin';
import BasicLogin from './BasicLogin';

// Optional: you can read this from environment variables
const FLAGSMITH_ENVIRONMENT_ID = import.meta.env.VITE_FLAGSMITH_ENV_ID;

const Login = () => {
  const [isInteractive, setIsInteractive] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initFlagsmith = async () => {
      try {
        await flagsmith.init({
          environmentID: FLAGSMITH_ENVIRONMENT_ID,
          onChange: () => {
            setIsInteractive(flagsmith.hasFeature('interactive_login'));
            setIsLoaded(true);
          }
        });
      } catch (error) {
        console.error('Failed to initialize Flagsmith', error);
        // Fallback to basic UI if Flagsmith fails
        setIsLoaded(true);
      }
    };

    initFlagsmith();
  }, []);

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0e0b29', color: '#fff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {/* A refined loading text for the authentication portal */}
          <p style={{ fontFamily: 'sans-serif', fontSize: '1.1rem', fontWeight: '500', letterSpacing: '0.5px' }}>
            Loading Authentication Portal...
          </p>
        </div>
      </div>
    );
  }

  return isInteractive ? <InteractiveLogin /> : <BasicLogin />;
};

export default Login;
