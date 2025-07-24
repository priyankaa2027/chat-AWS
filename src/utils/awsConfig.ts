import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';

type AmplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: string;
      userPoolClientId: string;
      signUpVerificationMethod: 'code';
    };
  };
  API: {
    REST: {
      [key: string]: {
        endpoint: string;
        region: string;
      };
    };
  };
};

const config: AmplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID!,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID!,
      signUpVerificationMethod: 'code',
    },
  },
  API: {
    REST: {
      chatAPI: {
        endpoint: process.env.REACT_APP_API_ENDPOINT!,
        region: process.env.REACT_APP_AWS_REGION!,
      },
    },
  },
};

// Configure token signing for WebSocket connections
// Add 'clear' method to satisfy KeyValueStorageInterface
cognitoUserPoolsTokenProvider.setKeyValueStorage({
  setItem: async (key: string, value: string) => {
    sessionStorage.setItem(key, value);
  },
  getItem: async (key: string) => {
    return sessionStorage.getItem(key);
  },
  removeItem: async (key: string) => {
    sessionStorage.removeItem(key);
  },
  clear: async () => {
    sessionStorage.clear();
  },
});

Amplify.configure(config);