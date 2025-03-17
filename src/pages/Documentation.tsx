import React from 'react';
import { Book, Code, Database, Lock, Calendar, Users, Settings, FileText, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  authentication: boolean;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  response?: {
    status: number;
    example: string;
  };
}

const endpoints: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/events',
    description: 'Retrieve a list of calendar events',
    authentication: true,
    parameters: [
      {
        name: 'start_date',
        type: 'string (ISO 8601)',
        required: true,
        description: 'Start date for the range of events'
      },
      {
        name: 'end_date',
        type: 'string (ISO 8601)',
        required: true,
        description: 'End date for the range of events'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "start_time": "string",
      "end_time": "string",
      "customer_name": "string",
      "so_id": "string"
    }
  ]
}`
    }
  },
  {
    method: 'POST',
    path: '/events',
    description: 'Create a new calendar event',
    authentication: true,
    parameters: [
      {
        name: 'title',
        type: 'string',
        required: true,
        description: 'Title of the event'
      },
      {
        name: 'start_time',
        type: 'string (ISO 8601)',
        required: true,
        description: 'Start time of the event'
      },
      {
        name: 'end_time',
        type: 'string (ISO 8601)',
        required: true,
        description: 'End time of the event'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "title": "string",
    "start_time": "string",
    "end_time": "string"
  }
}`
    }
  }
];

// Add new endpoints
const additionalEndpoints: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/accelerations',
    description: 'Retrieve a list of acceleration requests',
    authentication: true,
    parameters: [
      {
        name: 'product_type',
        type: 'string (uuid)',
        required: false,
        description: 'Filter by product type ID'
      },
      {
        name: 'status',
        type: 'string',
        required: false,
        description: 'Filter by status (pending, approved, rejected)'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "id": "number",
      "customer_name": "string",
      "so_id": "string",
      "sr_id": "string",
      "site_address": "string",
      "product_type": "uuid",
      "change_types": "uuid[]",
      "created_at": "string",
      "created_by": "uuid"
    }
  ]
}`
    }
  },
  {
    method: 'POST',
    path: '/accelerations',
    description: 'Create a new acceleration request',
    authentication: true,
    parameters: [
      {
        name: 'customer_name',
        type: 'string',
        required: true,
        description: 'Name of the customer'
      },
      {
        name: 'so_id',
        type: 'string',
        required: true,
        description: 'Service Order ID'
      },
      {
        name: 'sr_id',
        type: 'string',
        required: true,
        description: 'Service Request ID'
      },
      {
        name: 'site_address',
        type: 'string',
        required: true,
        description: 'Customer site address'
      },
      {
        name: 'product_type',
        type: 'string (uuid)',
        required: true,
        description: 'Product type ID'
      },
      {
        name: 'change_types',
        type: 'array<string> (uuid[])',
        required: true,
        description: 'Array of change type IDs'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "number",
    "customer_name": "string",
    "so_id": "string",
    "created_at": "string"
  }
}`
    }
  },
  {
    method: 'GET',
    path: '/availability',
    description: 'Get available time slots',
    authentication: true,
    parameters: [
      {
        name: 'date',
        type: 'string (YYYY-MM-DD)',
        required: true,
        description: 'Date to check availability'
      },
      {
        name: 'product_type',
        type: 'string (uuid)',
        required: true,
        description: 'Product type ID to check availability for'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "start_time": "string",
      "end_time": "string",
      "capacity": "number",
      "available": "number"
    }
  ]
}`
    }
  },
  {
    method: 'GET',
    path: '/users/me',
    description: 'Get current user information',
    authentication: true,
    response: {
      status: 200,
      example: `{
  "data": {
    "id": "uuid",
    "email": "string",
    "role": "string",
    "team_id": "uuid"
  }
}`
    }
  },
  {
    method: 'PUT',
    path: '/events/:id',
    description: 'Update an existing calendar event',
    authentication: true,
    parameters: [
      {
        name: 'title',
        type: 'string',
        required: false,
        description: 'New title for the event'
      },
      {
        name: 'start_time',
        type: 'string (ISO 8601)',
        required: false,
        description: 'New start time'
      },
      {
        name: 'end_time',
        type: 'string (ISO 8601)',
        required: false,
        description: 'New end time'
      },
      {
        name: 'notes',
        type: 'string',
        required: false,
        description: 'Updated notes'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": {
    "id": "uuid",
    "title": "string",
    "start_time": "string",
    "end_time": "string",
    "updated_at": "string"
  }
}`
    }
  },
  {
    method: 'DELETE',
    path: '/events/:id',
    description: 'Delete a calendar event',
    authentication: true,
    response: {
      status: 204,
      example: ''
    }
  }
];

// Add template management endpoints
const templateEndpoints: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/templates',
    description: 'Retrieve all templates',
    authentication: true,
    parameters: [
      {
        name: 'type',
        type: 'string',
        required: false,
        description: 'Filter by template type (email, sow)'
      },
      {
        name: 'is_active',
        type: 'boolean',
        required: false,
        description: 'Filter by active status'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "type": "string",
      "content": "string",
      "is_active": "boolean",
      "created_at": "string",
      "updated_at": "string"
    }
  ]
}`
    }
  },
  {
    method: 'POST',
    path: '/templates',
    description: 'Create a new template',
    authentication: true,
    parameters: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Template name'
      },
      {
        name: 'type',
        type: 'string',
        required: true,
        description: 'Template type (email, sow)'
      },
      {
        name: 'content',
        type: 'string',
        required: true,
        description: 'Template content with variables'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "name": "string",
    "type": "string",
    "created_at": "string"
  }
}`
    }
  },
  {
    method: 'GET',
    path: '/product-types',
    description: 'Retrieve all product types',
    authentication: true,
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "created_at": "string",
      "change_types": [
        {
          "id": "uuid",
          "name": "string",
          "duration_minutes": "number",
          "is_exclusive": "boolean"
        }
      ]
    }
  ]
}`
    }
  },
  {
    method: 'POST',
    path: '/product-types',
    description: 'Create a new product type',
    authentication: true,
    parameters: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Product type name'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "name": "string",
    "created_at": "string"
  }
}`
    }
  },
  {
    method: 'POST',
    path: '/change-types',
    description: 'Create a new change type',
    authentication: true,
    parameters: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Change type name'
      },
      {
        name: 'product_type_id',
        type: 'string (uuid)',
        required: true,
        description: 'Associated product type ID'
      },
      {
        name: 'duration_minutes',
        type: 'number',
        required: true,
        description: 'Duration in minutes'
      },
      {
        name: 'is_exclusive',
        type: 'boolean',
        required: true,
        description: 'Whether this change type is exclusive'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "name": "string",
    "product_type_id": "uuid",
    "duration_minutes": "number",
    "is_exclusive": "boolean",
    "created_at": "string"
  }
}`
    }
  },
  {
    method: 'PUT',
    path: '/templates/:id/activate',
    description: 'Set a template as active (deactivates other templates of the same type)',
    authentication: true,
    response: {
      status: 200,
      example: `{
  "data": {
    "id": "uuid",
    "is_active": true,
    "updated_at": "string"
  }
}`
    }
  }
];

// Add availability management endpoints
const availabilityEndpoints: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/availability/defaults',
    description: 'Retrieve default availability settings for each day of the week',
    authentication: true,
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "id": "uuid",
      "day_of_week": "number",
      "start_time": "string (HH:mm)",
      "end_time": "string (HH:mm)",
      "capacity": "number"
    }
  ]
}`
    }
  },
  {
    method: 'POST',
    path: '/availability/defaults',
    description: 'Create a new default availability setting',
    authentication: true,
    parameters: [
      {
        name: 'day_of_week',
        type: 'number (0-6)',
        required: true,
        description: 'Day of week (0 = Sunday, 6 = Saturday)'
      },
      {
        name: 'start_time',
        type: 'string (HH:mm)',
        required: true,
        description: 'Start time in 24-hour format'
      },
      {
        name: 'end_time',
        type: 'string (HH:mm)',
        required: true,
        description: 'End time in 24-hour format'
      },
      {
        name: 'capacity',
        type: 'number',
        required: true,
        description: 'Maximum number of concurrent appointments'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "day_of_week": "number",
    "start_time": "string",
    "end_time": "string",
    "capacity": "number"
  }
}`
    }
  },
  {
    method: 'GET',
    path: '/availability/overrides',
    description: 'Retrieve date-specific availability overrides',
    authentication: true,
    parameters: [
      {
        name: 'start_date',
        type: 'string (YYYY-MM-DD)',
        required: false,
        description: 'Start date for filtering overrides'
      },
      {
        name: 'end_date',
        type: 'string (YYYY-MM-DD)',
        required: false,
        description: 'End date for filtering overrides'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "id": "uuid",
      "override_date": "string",
      "start_time": "string",
      "end_time": "string",
      "capacity": "number"
    }
  ]
}`
    }
  },
  {
    method: 'POST',
    path: '/availability/defaults/engineer',
    description: 'Assign an engineer to a specific time slot',
    authentication: true,
    parameters: [
      {
        name: 'day_of_week',
        type: 'number (0-6)',
        required: true,
        description: 'Day of week (0 = Sunday, 6 = Saturday)'
      },
      {
        name: 'start_time',
        type: 'string (HH:mm)',
        required: true,
        description: 'Start time in 24-hour format'
      },
      {
        name: 'end_time',
        type: 'string (HH:mm)',
        required: true,
        description: 'End time in 24-hour format'
      },
      {
        name: 'engineer_id',
        type: 'string (uuid)',
        required: true,
        description: 'ID of the engineer to assign'
      },
      {
        name: 'team_id',
        type: 'string (uuid)',
        required: true,
        description: 'ID of the team'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "day_of_week": "number",
    "start_time": "string",
    "end_time": "string",
    "engineer_id": "string",
    "team_id": "string"
  }
}`
    }
  },
  {
    method: 'POST',
    path: '/availability/overrides',
    description: 'Create a date-specific availability override',
    authentication: true,
    parameters: [
      {
        name: 'override_date',
        type: 'string (YYYY-MM-DD)',
        required: true,
        description: 'Date for the override'
      },
      {
        name: 'start_time',
        type: 'string (HH:mm)',
        required: true,
        description: 'Start time in 24-hour format'
      },
      {
        name: 'end_time',
        type: 'string (HH:mm)',
        required: true,
        description: 'End time in 24-hour format'
      },
      {
        name: 'capacity',
        type: 'number',
        required: true,
        description: 'Maximum number of concurrent appointments'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "override_date": "string",
    "start_time": "string",
    "end_time": "string",
    "capacity": "number"
  }
}`
    }
  },
  {
    method: 'GET',
    path: '/blocked-dates',
    description: 'Retrieve blocked dates',
    authentication: true,
    parameters: [
      {
        name: 'start_date',
        type: 'string (YYYY-MM-DD)',
        required: false,
        description: 'Start date for filtering blocked dates'
      },
      {
        name: 'end_date',
        type: 'string (YYYY-MM-DD)',
        required: false,
        description: 'End date for filtering blocked dates'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "id": "uuid",
      "date": "string",
      "reason": "string"
    }
  ]
}`
    }
  },
  {
    method: 'POST',
    path: '/blocked-dates',
    description: 'Block a specific date',
    authentication: true,
    parameters: [
      {
        name: 'date',
        type: 'string (YYYY-MM-DD)',
        required: true,
        description: 'Date to block'
      },
      {
        name: 'reason',
        type: 'string',
        required: false,
        description: 'Reason for blocking the date'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "date": "string",
    "reason": "string"
  }
}`
    }
  },
  {
    method: 'GET',
    path: '/acceleration-fields',
    description: 'Retrieve all acceleration fields configuration',
    authentication: true,
    parameters: [
      {
        name: 'show_in_create_form',
        type: 'boolean',
        required: false,
        description: 'Filter fields by their visibility in create form'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "label": "string",
      "type": "string",
      "required": "boolean",
      "order": "number",
      "options": {
        "options": ["string"]
      },
      "show_in_create_form": "boolean"
    }
  ]
}`
    }
  },
  {
    method: 'POST',
    path: '/acceleration-fields',
    description: 'Create a new acceleration field',
    authentication: true,
    parameters: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Field name (will be converted to snake_case)'
      },
      {
        name: 'label',
        type: 'string',
        required: true,
        description: 'Display label for the field'
      },
      {
        name: 'type',
        type: 'string',
        required: true,
        description: 'Field type (text, select, textarea, product_type, change_type)'
      },
      {
        name: 'required',
        type: 'boolean',
        required: true,
        description: 'Whether the field is required'
      },
      {
        name: 'order',
        type: 'number',
        required: true,
        description: 'Display order of the field'
      },
      {
        name: 'options',
        type: 'object',
        required: false,
        description: 'Options for select fields: { options: string[] }'
      },
      {
        name: 'show_in_create_form',
        type: 'boolean',
        required: true,
        description: 'Whether to show this field in the create form'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "name": "string",
    "label": "string",
    "type": "string",
    "created_at": "string"
  }
}`
    }
  },
  {
    method: 'PUT',
    path: '/acceleration-fields/:id',
    description: 'Update an acceleration field',
    authentication: true,
    parameters: [
      {
        name: 'label',
        type: 'string',
        required: false,
        description: 'New display label'
      },
      {
        name: 'required',
        type: 'boolean',
        required: false,
        description: 'Update required status'
      },
      {
        name: 'order',
        type: 'number',
        required: false,
        description: 'New display order'
      },
      {
        name: 'options',
        type: 'object',
        required: false,
        description: 'Updated options for select fields'
      },
      {
        name: 'show_in_create_form',
        type: 'boolean',
        required: false,
        description: 'Update visibility in create form'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": {
    "id": "uuid",
    "label": "string",
    "updated_at": "string"
  }
}`
    }
  },
  {
    method: 'DELETE',
    path: '/acceleration-fields/:id',
    description: 'Delete an acceleration field',
    authentication: true,
    response: {
      status: 204,
      example: ''
    }
  }
];

// Add Teams meeting endpoints
const teamsMeetingEndpoints: EndpointDoc[] = [
  {
    method: 'POST',
    path: '/teams/meetings',
    description: 'Create a new Teams meeting for an appointment',
    authentication: true,
    parameters: [
      {
        name: 'startTime',
        type: 'string (ISO 8601)',
        required: true,
        description: 'Meeting start time'
      },
      {
        name: 'endTime',
        type: 'string (ISO 8601)',
        required: true,
        description: 'Meeting end time'
      },
      {
        name: 'title',
        type: 'string',
        required: true,
        description: 'Meeting title (e.g., SO-12345)'
      },
      {
        name: 'customerName',
        type: 'string',
        required: true,
        description: 'Customer name for meeting details'
      },
      {
        name: 'soId',
        type: 'string',
        required: true,
        description: 'Service Order ID for reference'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "string",
    "joinUrl": "string",
    "createdAt": "string"
  }
}`
    }
  },
  {
    method: 'PUT',
    path: '/teams/meetings/:id',
    description: 'Update an existing Teams meeting',
    authentication: true,
    parameters: [
      {
        name: 'startTime',
        type: 'string (ISO 8601)',
        required: false,
        description: 'New meeting start time'
      },
      {
        name: 'endTime',
        type: 'string (ISO 8601)',
        required: false,
        description: 'New meeting end time'
      },
      {
        name: 'title',
        type: 'string',
        required: false,
        description: 'New meeting title'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": {
    "id": "string",
    "joinUrl": "string",
    "updatedAt": "string"
  }
}`
    }
  },
  {
    method: 'DELETE',
    path: '/teams/meetings/:id',
    description: 'Delete a Teams meeting',
    authentication: true,
    response: {
      status: 204,
      example: ''
    }
  },
  {
    method: 'GET',
    path: '/teams/meetings/:id',
    description: 'Get Teams meeting details',
    authentication: true,
    response: {
      status: 200,
      example: `{
  "data": {
    "id": "string",
    "joinUrl": "string",
    "title": "string",
    "startTime": "string",
    "endTime": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}`
    }
  }
];

// Add scheduling threshold endpoints
const schedulingThresholdEndpoints: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/scheduling-thresholds',
    description: 'Retrieve scheduling thresholds for all product types',
    authentication: true,
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "id": "uuid",
      "product_type_id": "uuid",
      "minimum_days_notice": "number",
      "max_displayed_slots": "number",
      "created_at": "string",
      "updated_at": "string"
    }
  ]
}`
    }
  },
  {
    method: 'POST',
    path: '/scheduling-thresholds',
    description: 'Create a scheduling threshold for a product type',
    authentication: true,
    parameters: [
      {
        name: 'product_type_id',
        type: 'string (uuid)',
        required: true,
        description: 'Product type ID to create threshold for'
      },
      {
        name: 'minimum_days_notice',
        type: 'number',
        required: true,
        description: 'Minimum number of days notice required for scheduling'
      },
      {
        name: 'max_displayed_slots',
        type: 'number',
        required: true,
        description: 'Maximum number of time slots to display in suggestions'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "product_type_id": "uuid",
    "minimum_days_notice": "number",
    "max_displayed_slots": "number",
    "created_at": "string"
  }
}`
    }
  },
  {
    method: 'PUT',
    path: '/scheduling-thresholds/:id',
    description: 'Update a scheduling threshold',
    authentication: true,
    parameters: [
      {
        name: 'minimum_days_notice',
        type: 'number',
        required: false,
        description: 'New minimum days notice requirement'
      },
      {
        name: 'max_displayed_slots',
        type: 'number',
        required: false,
        description: 'New maximum displayed slots'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": {
    "id": "uuid",
    "minimum_days_notice": "number",
    "max_displayed_slots": "number",
    "updated_at": "string"
  }
}`
    }
  },
  {
    method: 'GET',
    path: '/scheduling-thresholds/:id',
    description: 'Get scheduling threshold details',
    authentication: true,
    response: {
      status: 200,
      example: `{
  "data": {
    "id": "uuid",
    "product_type_id": "uuid",
    "minimum_days_notice": "number",
    "max_displayed_slots": "number",
    "created_at": "string",
    "updated_at": "string"
  }
}`
    }
  }
];

function MethodBadge({ method }: { method: EndpointDoc['method'] }) {
  const colors = {
    GET: 'bg-green-100 text-green-800',
    POST: 'bg-blue-100 text-blue-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[method]}`}>
      {method}
    </span>
  );
}

export function Documentation() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">API Documentation</h1>
        <p className="text-gray-600 mb-6">
          Welcome to the Calendar Tool API documentation. This documentation provides information about the available endpoints and how to use them.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Code className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">REST API</h3>
                  <p className="text-sm text-gray-500">JSON-based REST API</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Supabase</h3>
                  <p className="text-sm text-gray-500">Powered by Supabase</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Authentication</h3>
                  <p className="text-sm text-gray-500">JWT-based auth</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Book className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Documentation</h3>
                  <p className="text-sm text-gray-500">Detailed guides</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Documentation */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Feature Documentation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Modify Availability Documentation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Modify Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    The Modify Availability page allows administrators to manage team and engineer schedules, capacity overrides, and blocked dates.
                  </p>
                  
                  <h3 className="font-medium text-gray-900">Key Features</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li>Team-based scheduling with engineer assignments</li>
                    <li>Weekly schedule management with day-by-day configuration</li>
                    <li>Engineer-specific time slots with visual indicators</li>
                    <li>Capacity management for concurrent appointments</li>
                    <li>Date-specific capacity overrides</li>
                    <li>Blocked date management</li>
                  </ul>
                  
                  <h3 className="font-medium text-gray-900">Usage</h3>
                  <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                    <li>Select a team to manage their availability</li>
                    <li>Optionally select a specific engineer to view or modify their schedule</li>
                    <li>Select days of the week to add time ranges</li>
                    <li>Configure time ranges with start time, end time, and capacity</li>
                    <li>Assign engineers to specific time slots</li>
                    <li>Create date-specific overrides for special scheduling needs</li>
                    <li>Block dates when no appointments should be scheduled</li>
                  </ol>
                  
                  <h3 className="font-medium text-gray-900">Engineer Assignment</h3>
                  <p className="text-gray-600">
                    Each time slot can be assigned to a specific engineer. Engineer assignments are visually indicated with avatar icons in both the base schedule and total capacity views. When multiple engineers are assigned to overlapping time slots, their combined capacity is shown in the total capacity section.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Workflows Documentation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-600" />
                  Modify Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    The Modify Workflows page allows administrators to configure product types and their associated change types.
                  </p>
                  
                  <h3 className="font-medium text-gray-900">Key Features</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li>Team-based product type management</li>
                    <li>Change type configuration with duration settings</li>
                    <li>Exclusive change type support</li>
                    <li>Minimum notice period configuration</li>
                  </ul>
                  
                  <h3 className="font-medium text-gray-900">Usage</h3>
                  <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                    <li>Select a team to manage their product types</li>
                    <li>Create or modify product types</li>
                    <li>Set minimum days notice required for scheduling</li>
                    <li>Create change types for each product type</li>
                    <li>Configure duration in minutes for each change type</li>
                    <li>Set exclusive flag for change types that cannot be combined</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
            
            {/* Templates Documentation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  Modify Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    The Modify Templates page allows administrators to create and manage email and SOW templates with variable substitution.
                  </p>
                  
                  <h3 className="font-medium text-gray-900">Key Features</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li>Email and SOW template management</li>
                    <li>Variable substitution support</li>
                    <li>Active template selection</li>
                    <li>Template preview</li>
                  </ul>
                  
                  <h3 className="font-medium text-gray-900">Available Variables</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li><code>{'{CustomerName}'}</code> - Customer name</li>
                    <li><code>{'{SOID}'}</code> - Service Order ID</li>
                    <li><code>{'{SRID}'}</code> - Service Request ID</li>
                    <li><code>{'{CustomerAddress}'}</code> - Customer address</li>
                    <li><code>{'{EventDate}'}</code> - Appointment date</li>
                    <li><code>{'{EventStartTime}'}</code> - Appointment start time</li>
                    <li><code>{'{EventEndTime}'}</code> - Appointment end time</li>
                    <li><code>{'{ProductType}'}</code> - Product type name</li>
                    <li><code>{'{ChangeTypes}'}</code> - List of change types</li>
                    <li><code>{'{Notes}'}</code> - Additional notes</li>
                    <li><code>{'{Bridge}'}</code> - Conference bridge details</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            {/* Accelerations Documentation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-red-600" />
                  Accelerations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    The Accelerations feature allows booking appointments in time slots that are fully booked or outside normal availability.
                  </p>
                  
                  <h3 className="font-medium text-gray-900">Key Features</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li>Acceleration mode toggle in appointment creation</li>
                    <li>Approval workflow for acceleration requests</li>
                    <li>Customizable acceleration fields</li>
                    <li>Priority levels for accelerations</li>
                  </ul>
                  
                  <h3 className="font-medium text-gray-900">Acceleration Process</h3>
                  <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                    <li>Enable acceleration mode when creating an appointment</li>
                    <li>Select a time slot that is fully booked or outside normal hours</li>
                    <li>Complete the acceleration request form</li>
                    <li>Submit for approval</li>
                    <li>Managers review and approve/reject acceleration requests</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Authentication</h2>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              All API requests must include a valid JWT token in the Authorization header:
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <code>Authorization: Bearer {'<your-jwt-token>'}</code>
            </pre>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">Endpoints</h2>
          <div className="space-y-6">
            {[...endpoints, ...additionalEndpoints, ...templateEndpoints, ...availabilityEndpoints, ...teamsMeetingEndpoints, ...schedulingThresholdEndpoints].map((endpoint, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <MethodBadge method={endpoint.method} />
                    <code className="text-sm bg-gray-200 px-2 py-1 rounded">
                      {endpoint.path}
                    </code>
                  </div>
                  {endpoint.authentication && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Lock className="w-4 h-4 mr-1" />
                      Requires Authentication
                    </div>
                  )}
                </div>

                <p className="text-gray-600 mb-4">{endpoint.description}</p>

                {endpoint.parameters && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Parameters</h4>
                    <div className="bg-white rounded-md border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {endpoint.parameters.map((param, paramIndex) => (
                            <tr key={paramIndex}>
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">{param.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{param.type}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">
                                {param.required ? (
                                  <span className="text-red-600">Yes</span>
                                ) : (
                                  <span className="text-gray-500">No</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {endpoint.response && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Response</h4>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                      <pre className="text-sm">
                        <code>{endpoint.response.example}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}