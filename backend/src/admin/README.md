# Admin Module API Documentation

This module provides endpoints for admin users to manage the platform, approve tutors, and view analytics.

## Authentication

All endpoints require Bearer token authentication with an admin role. Unauthorized access attempts will result in a 401 Unauthorized response.

## Endpoints

### Dashboard Statistics

#### `GET /admin/dashboard`
Get comprehensive dashboard statistics for platform administration.

**Response:**
```json
{
  "userStats": {
    "totalUsers": 1248,
    "growthPercentage": 20
  },
  "approvalStats": {
    "pendingApprovals": 8,
    "requiresAttention": true
  },
  "revenueStats": {
    "totalRevenue": 24850,
    "growthPercentage": 18.5
  },
  "sessionStats": {
    "activeSessions": 32,
    "peakHoursChange": -25
  },
  "asOf": "2023-06-15T15:00:00Z"
}
```

### Tutor Approval Management

#### `GET /admin/tutors/pending`
Get a list of tutors pending approval with their details.

**Response:**
```json
[
  {
    "tutorId": 123,
    "name": "Dr. Robert Chen",
    "email": "robert.chen@example.com",
    "subjects": [
      {
        "subjectId": 5,
        "name": "Physics"
      },
      {
        "subjectId": 3,
        "name": "Mathematics"
      }
    ],
    "applicationDate": "2023-05-10T14:30:00Z",
    "profilePictureUrl": "https://example.com/profiles/robert-chen.jpg",
    "verificationStatus": {
      "status": "Incomplete",
      "pendingStep": "Background Check Pending",
      "backgroundCheckStatus": "pending",
      "documentVerified": true,
      "interviewScheduled": true
    }
  },
  {
    "tutorId": 124,
    "name": "Ms. Jessica Williams",
    "email": "jessica.williams@example.com",
    "subjects": [
      {
        "subjectId": 7,
        "name": "English Literature"
      }
    ],
    "applicationDate": "2023-05-09T10:15:00Z",
    "profilePictureUrl": null,
    "verificationStatus": {
      "status": "Incomplete",
      "pendingStep": "Document Verification Pending",
      "backgroundCheckStatus": "passed",
      "documentVerified": false,
      "interviewScheduled": false
    }
  }
]
```

#### `POST /admin/tutors/:tutorId/approve`
Approve a tutor application, allowing them to start tutoring on the platform.

**Path Parameters:**
- `tutorId` (number): The ID of the tutor to approve

**Response:**
```json
{
  "tutorId": 123,
  "name": "Dr. Robert Chen",
  "email": "robert.chen@example.com",
  "approved": true,
  "approvedAt": "2023-06-15T15:30:00Z"
}
```

#### `POST /admin/tutors/:tutorId/reject`
Reject a tutor application with an optional reason.

**Path Parameters:**
- `tutorId` (number): The ID of the tutor to reject

**Request Body:**
```json
{
  "reason": "Insufficient qualifications for the subjects"
}
```

**Response:**
```json
{
  "tutorId": 124,
  "name": "Ms. Jessica Williams",
  "email": "jessica.williams@example.com",
  "status": "rejected",
  "reason": "Insufficient qualifications for the subjects"
}
```

### Platform Analytics

#### `GET /admin/analytics`
Get detailed platform analytics for monitoring performance metrics.

**Response:**
```json
{
  "userMetrics": {
    "activeUsers": 845,
    "growthPercentage": 12
  },
  "sessionMetrics": {
    "completionRate": 94.8,
    "completionRateGrowth": 2.3,
    "averageDuration": 52,
    "durationGrowth": 5
  },
  "supportMetrics": {
    "openTickets": 28,
    "ticketsChangePercentage": -15
  },
  "asOf": "2023-06-15T15:00:00Z"
}
```

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Only admin users can access this endpoint"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Tutor with ID 123 not found or already approved"
}
``` 