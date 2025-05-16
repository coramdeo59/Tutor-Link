# Notification Module API Documentation

This module provides endpoints for managing notifications for various user types in the Tutor-Link platform.

## Authentication

All endpoints require Bearer token authentication. Specific endpoints have role-based access controls. Unauthorized access attempts will result in a 401 Unauthorized response.

## Notification Types

The platform supports the following notification types:

- `session_reminder` - Reminder about an upcoming tutoring session
- `session_cancelled` - Alert that a session has been cancelled
- `session_booked` - Notification that a new session has been booked
- `achievement_unlocked` - Notification when a child earns an achievement
- `tutor_approved` - Alert for tutors when their application is approved
- `tutor_rejected` - Alert for tutors when their application is rejected
- `payment_received` - Notification of payment receipt
- `payment_due` - Reminder about an upcoming payment
- `child_progress_update` - Update on a child's learning progress
- `system_announcement` - Platform-wide announcement

## Endpoints

### User Notifications

#### `GET /notifications`
Get notifications for the currently authenticated user.

**Query Parameters:**
- `unreadOnly` (boolean, optional): Set to `true` to get only unread notifications
- `types` (string[], optional): Array of notification types to filter by
- `limit` (number, optional): Maximum number of notifications to return
- `offset` (number, optional): Offset for pagination

**Response:**
```json
{
  "notifications": [
    {
      "notificationId": 123,
      "userId": 456,
      "title": "Upcoming Session Reminder",
      "message": "Your session \"Math Tutoring\" is scheduled for Mon, Jun 15, 03:30 PM.",
      "type": "session_reminder",
      "read": false,
      "actionUrl": "/sessions/789",
      "relatedEntityId": 789,
      "relatedEntityType": "tutoring_session",
      "createdAt": "2023-06-14T15:00:00Z",
      "expiresAt": "2023-06-15T16:30:00Z"
    }
  ],
  "unreadCount": 1,
  "totalCount": 1
}
```

#### `GET /notifications/count`
Get count of unread notifications for the currently authenticated user.

**Response:**
```json
{
  "unreadCount": 5
}
```

#### `PUT /notifications/read`
Mark notifications as read for the authenticated user.

**Request Body:**
```json
{
  "notificationIds": [123, 456, 789]
}
```

OR

```json
{
  "markAll": true
}
```

**Response:**
```json
{
  "success": true,
  "markedAsRead": 3,
  "notificationIds": [123, 456, 789]
}
```

### Admin Only Endpoints

#### `POST /notifications/create`
Create a new notification for a specific user (Admin only).

**Request Body:**
```json
{
  "userId": 456,
  "title": "Important Platform Update",
  "message": "Tutor-Link will be undergoing maintenance on June 15th from 2-4 AM EST.",
  "type": "system_announcement",
  "actionUrl": "/announcements/123",
  "expiresAt": "2023-06-16T00:00:00Z"
}
```

**Response:** The created notification object.

#### `POST /notifications/bulk`
Send a notification to multiple users (Admin only).

**Request Body:**
```json
{
  "title": "New Feature Announcement",
  "message": "We've added a new progress tracking feature to Tutor-Link!",
  "type": "system_announcement",
  "actionUrl": "/features/new",
  "roles": ["parent", "tutor"],
  "expiresAt": "2023-07-01T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "createdCount": 524,
  "targetUserCount": 524
}
```

#### `DELETE /notifications/expired`
Delete all expired notifications (Admin only).

**Response:**
```json
{
  "success": true,
  "deletedCount": 1235
}
```

#### `GET /notifications/user/:userId`
Get notifications for a specific user (Admin only).

**Path Parameters:**
- `userId` (number): The ID of the user to get notifications for

**Query Parameters:** Same as `GET /notifications`

**Response:** Same format as `GET /notifications`

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Only admin users can view notifications for other users"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User with ID 123 not found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "No notification IDs provided"
}
``` 