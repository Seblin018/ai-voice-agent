# Bland.ai Integration API

This directory contains Vercel serverless functions for integrating with Bland.ai's AI phone agent service.

## Environment Variables Required

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
BLAND_API_KEY=your_bland_api_key
```

## API Endpoints

### 1. `/api/bland-webhook.ts`
**Purpose**: Handles incoming webhooks from Bland.ai when calls complete

**Method**: POST

**Query Parameters**:
- `business_id`: The ID of the business that received the call

**Request Body**: Bland.ai webhook payload containing:
- `call_id`: Unique identifier for the call
- `from`: Caller's phone number
- `to`: Business phone number
- `duration`: Call duration in seconds
- `recording_url`: URL to call recording (optional)
- `transcript`: Call transcript (optional)
- `concatenated_transcript`: Full conversation transcript (optional)
- `variables`: Extracted data like name, service, urgency, etc.

**Response**: 200 OK with success confirmation

### 2. `/api/provision-number.ts`
**Purpose**: Provisions a new phone number and creates an AI agent for a business

**Method**: POST

**Request Body**:
```json
{
  "business_id": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "phone_number": "+15551234567",
  "agent_id": "agent_123",
  "cost": 15.00,
  "monthly_cost": 5.00
}
```

### 3. `/api/toggle-agent.ts`
**Purpose**: Enables or disables an AI agent

**Method**: POST

**Request Body**:
```json
{
  "business_id": "uuid",
  "enabled": true
}
```

**Response**:
```json
{
  "success": true,
  "enabled": true,
  "message": "AI agent activated successfully"
}
```

### 4. `/api/update-agent.ts`
**Purpose**: Updates AI agent settings when business information changes

**Method**: POST

**Request Body**:
```json
{
  "business_id": "uuid",
  "business_name": "New Business Name",
  "phone_number": "+15551234567",
  "industry": "Septic Services"
}
```

**Response**:
```json
{
  "success": true,
  "message": "AI agent settings updated successfully"
}
```

## Database Tables Used

### `calls`
Stores call records with:
- `business_id`
- `caller_phone`
- `caller_name`
- `start_time`
- `end_time`
- `duration_seconds`
- `outcome`
- `service_requested`
- `recording_url`
- `transcript`

### `appointments`
Stores booked appointments with:
- `business_id`
- `customer_name`
- `customer_phone`
- `customer_address`
- `service_type`
- `appointment_date`
- `status`
- `call_id`

### `businesses`
Updated with:
- `bland_phone_number`
- `bland_agent_id`
- `ai_status`

### `business_activity_log`
Logs all AI-related activities for audit trail.

## Error Handling

All functions include comprehensive error handling and logging. Errors are returned with appropriate HTTP status codes:

- `400`: Bad Request (missing parameters)
- `404`: Not Found (business not found)
- `405`: Method Not Allowed
- `500`: Internal Server Error

## CORS

All functions include proper CORS headers for cross-origin requests.