import React, { useEffect, useState } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from 'aws-amplify/auth';
import { store } from './store/store';
import { loginSuccess } from './store/authSlice';
import Login from './features/Auth/Login';
import Register from './features/Auth/Register';
import ChatRoom from './features/Chat/ChatRoom';
import ErrorBoundary from './features/Common/ErrorBoundary';
import { RootState } from './store/store';
import './utils/awsConfig';
import './App.css';

const AppContent = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [showRegister, setShowRegister] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const user = await getCurrentUser();
      dispatch(loginSuccess(user));
    } catch (error) {
      // User is not authenticated
    }
  };

  const renderAuth = () => {
    if (showRegister) {
      return (
        <ErrorBoundary>
          <Register
            onSuccess={() => checkAuthState()}
            switchToLogin={() => setShowRegister(false)}
          />
        </ErrorBoundary>
      );
    }

    return (
      <ErrorBoundary>
        <Login
          switchToRegister={() => setShowRegister(true)}
        />
      </ErrorBoundary>
    );
  };

  return (
    <div className="App">
      <ErrorBoundary>
        {isAuthenticated ? (
          <ChatRoom />
        ) : (
          renderAuth()
        )}
      </ErrorBoundary>
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
