
# Chat-AWS: Real-Time Chat Application with AWS Integration

## Overview

Chat-AWS is a full-stack, real-time chat application built with React, Redux, TypeScript, Tailwind CSS, and AWS services. It features secure authentication via AWS Cognito, RESTful API integration, and real-time messaging using WebSockets. The project is designed for scalability, security, and modern UI/UX.

---

## Features

- **User Authentication:** Secure sign-up, login, and email verification using AWS Cognito.
- **Real-Time Chat:** Instant messaging powered by WebSocket connections.
- **REST API Integration:** Fetch chat history and user data from AWS API Gateway/Lambda.
- **User List:** See who is online in the chat room.
- **Error Handling:** Robust error boundaries and user feedback.
- **Modern UI:** Responsive design with Tailwind CSS.
- **Sanitization:** Prevents XSS and unsafe message content.

---

## Project Structure

```
chat-AWS/
├── public/
├── src/
│   ├── features/
│   │   ├── Auth/         # Login & Register components
│   │   ├── Chat/         # ChatRoom, ChatMessage, UserList
│   │   ├── Common/       # ErrorBoundary
│   ├── store/            # Redux slices & store
│   ├── utils/            # AWS config, WebSocket, sanitize
│   ├── App.tsx           # Main app logic
│   ├── index.tsx         # Entry point
│   ├── App.css, index.css
├── .env                  # Environment variables
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── README.md
```

---

## Prerequisites

- Node.js (v16+ recommended)
- npm (v8+ recommended)
- AWS account with Cognito, API Gateway, Lambda, and WebSocket API configured

---

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
REACT_APP_AWS_REGION=your-region
REACT_APP_USER_POOL_ID=your-user-pool-id
REACT_APP_USER_POOL_CLIENT_ID=your-user-pool-client-id
REACT_APP_API_ENDPOINT=your-api-endpoint
REACT_APP_WEBSOCKET_URL=your-websocket-url
```

Replace the values with your actual AWS configuration.

---

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/chat-AWS.git
   cd chat-AWS
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Install required PostCSS plugins if you see CSS build errors:
   ```sh
   npm install postcss-flexbugs-fixes postcss-preset-env --legacy-peer-deps
   ```

---

## Running the App (Development)

```sh
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Build for Production

```sh
npm run build
```
The optimized build will be in the `build/` folder.

---

## AWS Setup Guide

### Cognito User Pool
- Create a User Pool and App Client in AWS Cognito.
- Enable email verification.
- Copy the Pool ID and Client ID to your `.env`.

### API Gateway & Lambda
- Create REST endpoints for `/messages` and `/socket-connection`.
- Connect to Lambda functions for chat logic.
- Set the endpoint URL in `.env`.

### WebSocket API
- Create a WebSocket API in API Gateway.
- Implement Lambda authorizer for secure connections.
- Set the WebSocket URL in `.env`.

---

## Usage

1. Register a new account and verify your email.
2. Login to access the chat room.
3. Send and receive messages in real time.
4. View online users.

---

## Troubleshooting

- **CSS Build Errors:**
  - Install missing PostCSS plugins: `npm install postcss-flexbugs-fixes postcss-preset-env --legacy-peer-deps`
- **TypeScript Errors:**
  - Ensure all required methods (e.g., `clear` in KeyValueStorageInterface) are implemented.
- **AWS Errors:**
  - Double-check your `.env` values and AWS resource permissions.
- **WebSocket Issues:**
  - Make sure your WebSocket API is deployed and accessible.

---

## Deployment

You can deploy the frontend using:
- **AWS Amplify Hosting**
- **Vercel**
- **Netlify**

Follow the platform’s instructions for deploying a React app. Make sure your `.env` is set up for production.

---

## Contributing

Pull requests and issues are welcome! Please open an issue for bugs or feature requests.

---

## License

MIT
