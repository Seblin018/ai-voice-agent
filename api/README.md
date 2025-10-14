# AI Voice Agent API

This directory contains Vercel Serverless Functions for managing Bland AI voice agents.

## Endpoints

### 1. `/api/bland-webhook.ts`
**Purpose**: Handles incoming webhooks from Bland AI when calls complete

**Method**: POST  
**Authentication**: None (webhook endpoint)

**Request Body**:
```json
{
  "call_id": "string",
  "status": "completed" | "failed" | "no-answer",
  "duration": number,
  "recording_url": "string (optional)",
  "transcript": "string (optional)",
  "caller_phone": "string",
  "business_phone": "string",
  "agent_id": "string",
  "metadata": {
    "business_id": "string (optional)",
    "user_id": "string (optional)"
  }
}
```

**Response**:
```json
{
  "success": true,
  "call_id": "string",
  "outcome": "appointment_booked" | "info_request" | "hang_up"
}
```

### 2. `/api/create-agent.ts`
**Purpose**: Creates a new Bland AI agent when a business signs up

**Method**: POST  
**Authentication**: Required (via Supabase)

**Request Body**:
```json
{
  "business_id": "string",
  "business_name": "string",
  "business_phone": "string",
  "industry": "string",
  "services": [
    {
      "name": "string",
      "price_min": number,
      "price_max": number,
      "urgency": "Emergency" | "Same Day" | "Flexible"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "agent_id": "string",
  "phone_number": "string",
  "status": "string"
}
```

### 3. `/api/toggle-agent.ts`
**Purpose**: Turns AI agent on/off based on dashboard toggle

**Method**: POST  
**Authentication**: Required (via Supabase)

**Request Body**:
```json
{
  "business_id": "string",
  "status": "active" | "inactive"
}
```

**Response**:
```json
{
  "success": true,
  "status": "active" | "inactive",
  "message": "string"
}
```

### 4. `/api/update-agent.ts`
**Purpose**: Updates agent settings when user changes business info

**Method**: POST  
**Authentication**: Required (via Supabase)

**Request Body**:
```json
{
  "business_id": "string",
  "business_name": "string (optional)",
  "business_phone": "string (optional)",
  "industry": "string (optional)",
  "services": "array (optional)",
  "business_hours": "object (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "AI agent updated successfully"
}
```

## Environment Variables

The following environment variables need to be set in Vercel:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for server-side operations)
- `BLAND_API_KEY`: Your Bland AI API key

## Database Tables

These functions interact with the following Supabase tables:

- `businesses`: Stores business information and Bland agent details
- `calls`: Records of all incoming calls
- `appointments`: Scheduled appointments from calls
- `ai_activity_log`: Log of AI agent activities
- `services`: Business service offerings

## Error Handling

All endpoints include comprehensive error handling:
- Input validation
- Database error handling
- Bland AI API error handling
- Proper HTTP status codes
- Detailed error messages

## Security

- All endpoints (except webhook) require authentication
- Service role key used for database operations
- Input sanitization and validation
- Rate limiting handled by Vercel
