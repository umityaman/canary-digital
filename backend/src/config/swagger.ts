import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CANARY Equipment Rental Management API',
      version: '1.0.0',
      description: `
        Complete API documentation for CANARY Equipment Rental Management System.
        
        ## Features
        - Equipment management
        - Reservation system
        - Customer management
        - Notification system
        - Dashboard & Analytics
        - QR Code scanning
        - Smart pricing
        
        ## Authentication
        Most endpoints require JWT token authentication. Include the token in the Authorization header:
        \`Authorization: Bearer <your_token>\`
      `,
      contact: {
        name: 'API Support',
        email: 'support@canary.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.canary.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            error: {
              type: 'string',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['USER', 'ADMIN'] },
            companyId: { type: 'integer', nullable: true },
          },
        },
        Equipment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            serialNumber: { type: 'string', nullable: true },
            status: { 
              type: 'string', 
              enum: ['available', 'in-use', 'maintenance', 'retired'],
              default: 'available',
            },
            category: { type: 'string', nullable: true },
            location: { type: 'string', nullable: true },
            qrCode: { type: 'string', nullable: true },
            imageUrl: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Reservation: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            reservationNo: { type: 'string' },
            customerName: { type: 'string' },
            customerEmail: { type: 'string', format: 'email' },
            customerPhone: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            status: { 
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
            },
            totalAmount: { type: 'number', format: 'float' },
            notes: { type: 'string', nullable: true },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/ReservationItem' },
            },
          },
        },
        ReservationItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            reservationId: { type: 'integer' },
            equipmentId: { type: 'integer' },
            quantity: { type: 'integer' },
            pricePerDay: { type: 'number', format: 'float' },
            totalPrice: { type: 'number', format: 'float' },
            equipment: { $ref: '#/components/schemas/Equipment' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            title: { type: 'string' },
            message: { type: 'string' },
            type: { 
              type: 'string',
              enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'],
            },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        DashboardStats: {
          type: 'object',
          properties: {
            revenue: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                monthly: { type: 'number' },
                change: { type: 'number' },
              },
            },
            reservations: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                active: { type: 'integer' },
                completed: { type: 'integer' },
                change: { type: 'number' },
              },
            },
            equipment: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                available: { type: 'integer' },
                inUse: { type: 'integer' },
                maintenance: { type: 'integer' },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Dashboard', description: 'Dashboard and statistics' },
      { name: 'Equipment', description: 'Equipment management' },
      { name: 'Reservations', description: 'Reservation system' },
      { name: 'Customers', description: 'Customer management' },
      { name: 'Notifications', description: 'Notification system' },
      { name: 'Pricing', description: 'Smart pricing system' },
      { name: 'Reports', description: 'Reporting and analytics' },
      { name: 'Scan', description: 'QR/Barcode scanning' },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to API routes
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CANARY API Documentation',
  }));

  // JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger documentation available at /api-docs');
}

export default swaggerSpec;
