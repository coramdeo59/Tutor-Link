# Messaging Module API Documentation

The Messaging module provides real-time messaging functionality for the Tutor-Link platform.

## Features
- Direct messaging between users
- Group conversations
- Message history
- Read status tracking
- Real-time notifications via WebSockets
- Typing indicators

## Authentication

All endpoints require authentication. Include a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

Unauthorized access will result in a 401 Unauthorized response.

## REST API Endpoints

### Create a Conversation
Create a new conversation with one or more participants.

**Endpoint:** `POST /messaging/conversations`

**Request Body:**
```json
{
  "title": "Group Study Session",
  "participantIds": [2, 3, 4],
  "isGroupChat": true
}
```

For direct messages (1-to-1), omit the title and set `isGroupChat` to false or omit it. The title will be automatically generated from the participant's name.

**Response:** 201 Created
```json
{
  "conversationId": 123,
  "title": "Group Study Session",
  "isGroupChat": true,
  "participants": [
    {
      "userId": 1,
      "name": "Current User",
      "profilePictureUrl": "https://example.com/profile1.jpg",
      "isAdmin": true,
      "joinedAt": "2023-07-10T15:30:00Z",
      "lastReadAt": "2023-07-10T15:30:00Z"
    },
    {
      "userId": 2,
      "name": "John Doe",
      "profilePictureUrl": "https://example.com/profile2.jpg",
      "isAdmin": false,
      "joinedAt": "2023-07-10T15:30:00Z",
      "lastReadAt": null
    }
  ],
  "lastMessage": null,
  "lastMessageAt": "2023-07-10T15:30:00Z",
  "createdAt": "2023-07-10T15:30:00Z",
  "updatedAt": "2023-07-10T15:30:00Z"
}
```

### Get All Conversations
Retrieve all conversations for the authenticated user.

**Endpoint:** `GET /messaging/conversations`

**Query Parameters:**
- `limit` (optional): Maximum number of conversations to return (default: 20)
- `offset` (optional): Number of conversations to skip (default: 0)

**Response:** 200 OK
```json
{
  "conversations": [
    {
      "conversationId": 123,
      "title": "Group Study Session",
      "isGroupChat": true,
      "participants": [...],
      "lastMessage": {
        "messageId": 456,
        "senderId": 2,
        "senderName": "John Doe",
        "senderProfilePictureUrl": "https://example.com/profile2.jpg",
        "conversationId": 123,
        "content": "Are we meeting tomorrow?",
        "attachments": [],
        "replyToId": null,
        "readBy": [2, 1],
        "createdAt": "2023-07-10T16:00:00Z",
        "updatedAt": "2023-07-10T16:00:00Z"
      },
      "lastMessageAt": "2023-07-10T16:00:00Z",
      "createdAt": "2023-07-10T15:30:00Z",
      "updatedAt": "2023-07-10T16:00:00Z"
    }
  ],
  "total": 5,
  "offset": 0,
  "limit": 20
}
```

### Get a Conversation
Retrieve a specific conversation by ID.

**Endpoint:** `GET /messaging/conversations/:conversationId`

**Response:** 200 OK
```json
{
  "conversationId": 123,
  "title": "Group Study Session",
  "isGroupChat": true,
  "participants": [...],
  "lastMessage": {...},
  "lastMessageAt": "2023-07-10T16:00:00Z",
  "createdAt": "2023-07-10T15:30:00Z",
  "updatedAt": "2023-07-10T16:00:00Z"
}
```

### Update a Conversation
Update the title of a group conversation.

**Endpoint:** `PUT /messaging/conversations/:conversationId`

**Request Body:**
```json
{
  "title": "New Conversation Title"
}
```

**Response:** 200 OK
```json
{
  "conversationId": 123,
  "title": "New Conversation Title",
  "isGroupChat": true,
  "participants": [...],
  "lastMessage": {...},
  "lastMessageAt": "2023-07-10T16:00:00Z",
  "createdAt": "2023-07-10T15:30:00Z",
  "updatedAt": "2023-07-10T16:30:00Z"
}
```

### Send a Message
Send a new message in a conversation.

**Endpoint:** `POST /messaging/messages`

**Request Body:**
```json
{
  "conversationId": 123,
  "content": "Hello, how are you?",
  "attachments": [
    {
      "url": "https://example.com/file.pdf",
      "type": "document",
      "name": "Study Notes.pdf",
      "size": 1024000
    }
  ],
  "replyToId": 455
}
```

The `attachments` and `replyToId` fields are optional.

**Response:** 201 Created
```json
{
  "messageId": 456,
  "senderId": 1,
  "senderName": "Current User",
  "senderProfilePictureUrl": "https://example.com/profile1.jpg",
  "conversationId": 123,
  "content": "Hello, how are you?",
  "attachments": [...],
  "replyToId": 455,
  "readBy": [1],
  "createdAt": "2023-07-10T16:35:00Z",
  "updatedAt": "2023-07-10T16:35:00Z"
}
```

### Get Messages
Retrieve messages from a conversation.

**Endpoint:** `GET /messaging/conversations/:conversationId/messages`

**Query Parameters:**
- `limit` (optional): Maximum number of messages to return (default: 50, max: 100)
- `offset` (optional): Number of messages to skip (default: 0)
- `before` (optional): Only return messages sent before this timestamp (ISO format)
- `after` (optional): Only return messages sent after this timestamp (ISO format)
- `unreadOnly` (optional): If true, only return unread messages

**Response:** 200 OK
```json
{
  "messages": [
    {
      "messageId": 456,
      "senderId": 2,
      "senderName": "John Doe",
      "senderProfilePictureUrl": "https://example.com/profile2.jpg",
      "conversationId": 123,
      "content": "Hello, how are you?",
      "attachments": [],
      "replyToId": null,
      "readBy": [2, 1],
      "createdAt": "2023-07-10T16:35:00Z",
      "updatedAt": "2023-07-10T16:35:00Z"
    }
  ],
  "total": 10,
  "offset": 0,
  "limit": 50
}
```

### Mark Messages as Read
Mark messages as read by the authenticated user.

**Endpoint:** `PUT /messaging/messages/read`

**Request Body:**
```json
{
  "conversationId": 123,
  "messageIds": [456, 457, 458]
}
```

**Response:** 204 No Content

### Delete a Message
Delete a message from a conversation.

**Endpoint:** `DELETE /messaging/messages/:messageId/conversations/:conversationId`

**Response:** 204 No Content

### Add Participants
Add new participants to a group conversation.

**Endpoint:** `POST /messaging/conversations/:conversationId/participants`

**Request Body:**
```json
{
  "userIds": [5, 6]
}
```

**Response:** 200 OK
```json
{
  "conversationId": 123,
  "title": "Group Study Session",
  "isGroupChat": true,
  "participants": [...],
  "lastMessage": {...},
  "lastMessageAt": "2023-07-10T16:00:00Z",
  "createdAt": "2023-07-10T15:30:00Z",
  "updatedAt": "2023-07-10T16:40:00Z"
}
```

### Remove a Participant
Remove a participant from a group conversation.

**Endpoint:** `DELETE /messaging/conversations/:conversationId/participants/:userId`

**Response:** 200 OK
```json
{
  "conversationId": 123,
  "title": "Group Study Session",
  "isGroupChat": true,
  "participants": [...],
  "lastMessage": {...},
  "lastMessageAt": "2023-07-10T16:00:00Z",
  "createdAt": "2023-07-10T15:30:00Z",
  "updatedAt": "2023-07-10T16:45:00Z"
}
```

## WebSocket API

The Messaging module also provides a WebSocket interface for real-time communication.

### Connection
Connect to the WebSocket server at `/messaging`:

```javascript
import { io } from 'socket.io-client';

const socket = io('https://your-api-domain.com/messaging', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

You can also authenticate by including the token as a query parameter:
```javascript
const socket = io('https://your-api-domain.com/messaging?token=your-jwt-token');
```

### Events from Client to Server

#### Send a Message
```javascript
socket.emit('sendMessage', {
  conversationId: 123,
  content: 'Hello via WebSocket!',
  attachments: [],
  replyToId: null
});
```

#### Join a Conversation
Subscribe to real-time updates for a specific conversation:
```javascript
socket.emit('joinConversation', {
  conversationId: 123
});
```

#### Leave a Conversation
Unsubscribe from real-time updates for a specific conversation:
```javascript
socket.emit('leaveConversation', {
  conversationId: 123
});
```

#### Mark Messages as Read
```javascript
socket.emit('markMessagesRead', {
  conversationId: 123,
  messageIds: [456, 457, 458]
});
```

#### Typing Indicator
Notify when a user is typing:
```javascript
socket.emit('typing', {
  conversationId: 123,
  isTyping: true // Set to false when user stops typing
});
```

### Events from Server to Client

#### New Message
Triggered when a new message is received:
```javascript
socket.on('newMessage', (message) => {
  console.log('New message received:', message);
});
```

#### User Typing
Triggered when a user starts or stops typing:
```javascript
socket.on('userTyping', (data) => {
  console.log(`${data.userName} is ${data.isTyping ? 'typing...' : 'not typing'}`);
});
```

#### Messages Read
Triggered when messages are marked as read:
```javascript
socket.on('messagesRead', (data) => {
  console.log(`User ${data.userId} read messages: ${data.messageIds}`);
});
```

#### Joined Conversation
Triggered after successfully joining a conversation:
```javascript
socket.on('joinedConversation', (data) => {
  console.log(`Joined conversation: ${data.conversationId}`);
});
```

#### Left Conversation
Triggered after successfully leaving a conversation:
```javascript
socket.on('leftConversation', (data) => {
  console.log(`Left conversation: ${data.conversationId}`);
});
```

#### Error
Triggered when an error occurs:
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
});
```

### Example Usage

```javascript
import { io } from 'socket.io-client';

// Connect to WebSocket server
const socket = io('https://your-api-domain.com/messaging', {
  auth: { token: 'your-jwt-token' }
});

// Handle connection
socket.on('connect', () => {
  console.log('Connected to messaging service');
  
  // Join a conversation
  socket.emit('joinConversation', { conversationId: 123 });
});

// Handle new messages
socket.on('newMessage', (message) => {
  console.log('New message:', message);
  
  // Mark message as read
  socket.emit('markMessagesRead', {
    conversationId: message.conversationId,
    messageIds: [message.messageId]
  });
});

// Send a message
function sendMessage(content) {
  socket.emit('sendMessage', {
    conversationId: 123,
    content: content
  });
}

// Handle typing indicator
function handleTyping(isTyping) {
  socket.emit('typing', {
    conversationId: 123,
    isTyping: isTyping
  });
}

// Handle when others are typing
socket.on('userTyping', (data) => {
  if (data.isTyping) {
    showTypingIndicator(data.userName);
  } else {
    hideTypingIndicator(data.userName);
  }
});

// Handle errors
socket.on('error', (error) => {
  console.error('Error:', error.message);
});

// Handle disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from messaging service');
});
```

## Common Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You do not have permission to perform this action",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Conversation not found",
  "error": "Not Found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid input data",
  "error": "Bad Request",
  "validation": {
    "participantIds": [
      "participantIds must not be empty"
    ]
  }
}
``` 