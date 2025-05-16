# Parent Module API Documentation

This module provides endpoints for parent users to manage their children, view tutoring sessions, and access payment information.

## Authentication

All endpoints require Bearer token authentication with a parent role unless otherwise specified.

## Endpoints

### Dashboard

#### `GET /parents/dashboard`
Get the complete parent dashboard with all relevant information.

**Response:**
```json
{
  "parentName": "John Smith",
  "children": {
    "count": 2,
    "list": [/* array of child summary objects */]
  },
  "activeTutors": {
    "count": 3,
    "subjectCount": 5
  },
  "upcomingSessions": {
    "count": 7,
    "nextSession": {
      "dateTime": "2023-06-15T15:00:00Z",
      "info": "Emily's Math at 3:00 PM"
    }
  },
  "monthlySpending": {/* payment summary object */},
  "childrenProgress": [/* array of child progress objects */]
}
```

### Children Management

#### `GET /parents/children`
Get a list of all children for the authenticated parent.

**Response:**
```json
[
  {
    "childId": 1,
    "firstName": "Emily",
    "lastName": "Smith",
    "grade": "5th Grade",
    "age": 10,
    "overallProgress": 75,
    "nextSession": {
      "sessionId": 123,
      "title": "Math Fundamentals",
      "dateTime": "2023-06-15T15:00:00Z",
      "subject": "Mathematics"
    }
  },
  {/* more children */}
]
```

#### `GET /parents/children/:childId`
Get detailed information about a specific child.

**Response:**
```json
{
  "childId": 1,
  "firstName": "Emily",
  "lastName": "Smith",
  "username": "emilysmith",
  "dateOfBirth": "2013-04-12",
  "gradeLevelId": 5,
  "age": 10,
  "grade": "5th Grade",
  "upcomingSessions": [/* array of upcoming sessions */],
  "upcomingSessionCount": 3,
  "pastSessions": [/* array of past sessions */],
  "totalLearningHours": 24.5,
  "recentAchievements": [/* array of recent achievements */],
  "achievementCount": 7
}
```

#### `PATCH /parents/children/:childId`
Update a child's basic information.

**Request:**
```json
{
  "firstName": "Emily Rose",
  "lastName": "Smith",
  "dateOfBirth": "2013-04-12",
  "gradeLevelId": 6
}
```

**Response:**
```json
{
  "childId": 1,
  "firstName": "Emily Rose",
  "lastName": "Smith",
  "username": "emilysmith",
  "dateOfBirth": "2013-04-12",
  "gradeLevelId": 6,
  "createdAt": "2022-09-01T10:00:00Z",
  "updatedAt": "2023-06-10T15:30:00Z"
}
```

#### `PATCH /parents/children/:childId/credentials`
Update a child's login credentials.

**Request:**
```json
{
  "username": "emilyrose",
  "password": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Child credentials updated successfully",
  "updatedFields": ["username", "password"]
}
```

#### `GET /parents/verify-child/:childId`
Verify if a child belongs to the authenticated parent.

**Response:**
```json
{
  "verified": true,
  "childId": 1,
  "parentId": 42
}
```

### Sessions Management

#### `GET /parents/sessions`
Get all tutoring sessions for all children of the authenticated parent.

**Query Parameters:**
- `upcoming` (boolean): Filter for upcoming sessions only (true) or past sessions only (false)
- `childId` (number): Filter for sessions of a specific child
- `limit` (number): Limit the number of results returned

**Response:**
```json
[
  {
    "sessionId": 123,
    "title": "Math Fundamentals",
    "description": "Working on fractions and decimals",
    "startTime": "2023-06-15T15:00:00Z",
    "endTime": "2023-06-15T16:00:00Z",
    "topic": "Fractions",
    "completed": false,
    "cancelled": false,
    "childId": 1,
    "childFirstName": "Emily",
    "childLastName": "Smith",
    "tutorId": 42,
    "tutorName": "David Johnson",
    "subjectId": 3,
    "subjectName": "Mathematics"
  },
  {/* more sessions */}
]
```

#### `GET /parents/sessions/upcoming`
Get a summary of upcoming sessions for the authenticated parent's children.

**Response:**
```json
{
  "count": 7,
  "nextSession": {
    "dateTime": "2023-06-15T15:00:00Z",
    "info": "Emily's Math at 3:00 PM"
  }
}
```

### Tutors

#### `GET /parents/tutors/active`
Get a summary of active tutors for the authenticated parent's children.

**Response:**
```json
{
  "count": 3,
  "subjectCount": 5
}
```

### Payments

#### `GET /parents/payments/summary`
Get a summary of payment and spending for the authenticated parent.

**Response:**
```json
{
  "monthlySpending": 320,
  "sessionCount": 8,
  "upcomingPayment": {
    "amount": 320,
    "dueDate": "2023-07-01T00:00:00Z"
  },
  "recentTransactions": [
    {
      "tutorName": "David Johnson",
      "subject": "Mathematics",
      "amount": 40,
      "date": "2023-06-05T15:00:00Z"
    },
    {/* more transactions */}
  ]
}
```

### Children Progress

#### `GET /parents/children/progress`
Get detailed progress information for all children of the authenticated parent.

**Response:**
```json
[
  {
    "childId": 1,
    "firstName": "Emily",
    "lastName": "Smith",
    "age": 10,
    "grade": "5th Grade",
    "overallProgress": 75,
    "nextSession": {
      "title": "Math Fundamentals",
      "dateTime": "2023-06-15T15:00:00Z",
      "subject": "Mathematics"
    }
  },
  {/* more children progress */}
]
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
  "message": "Only parent accounts can access this endpoint"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Child with ID 123 not found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "No fields to update"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Username 'emilyrose' is already in use by another child"
}
``` 