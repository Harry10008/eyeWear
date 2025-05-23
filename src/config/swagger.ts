import swaggerAutogen from 'swagger-autogen';
import path from 'path';
import { config } from './config';

const doc = {
  info: {
    title: 'EyeWear API',
    description: 'API documentation for EyeWear e-commerce platform',
    version: '1.0.0',
    contact: {
      name: 'API Support',
      email: 'support@eyewear.com'
    }
  },
  servers: [
    {
      url: `http://${config.host}:${config.port}`,
      description: 'Development server'
    }
  ],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Enter your bearer token in the format: Bearer <token>'
    }
  },
  components: {
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['fullName', 'email', 'password', 'confirmPassword', 'mobileNumber', 'dateOfBirth', 'gender', 'addresses'],
        properties: {
          fullName: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            example: 'John Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com'
          },
          password: {
            type: 'string',
            minLength: 8,
            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
            example: 'Password123!'
          },
          confirmPassword: {
            type: 'string',
            example: 'Password123!'
          },
          mobileNumber: {
            type: 'string',
            pattern: '^[0-9]{10}$',
            example: '1234567890'
          },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            example: '1990-01-01'
          },
          gender: {
            type: 'string',
            enum: ['male', 'female', 'other'],
            example: 'male'
          },
          addresses: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['street', 'city', 'state', 'country', 'pincode'],
              properties: {
                street: {
                  type: 'string',
                  example: '123 Main St'
                },
                city: {
                  type: 'string',
                  example: 'New York'
                },
                state: {
                  type: 'string',
                  example: 'NY'
                },
                country: {
                  type: 'string',
                  example: 'USA'
                },
                pincode: {
                  type: 'string',
                  pattern: '^[0-9]{6}$',
                  example: '123456'
                },
                isDefault: {
                  type: 'boolean',
                  example: true
                }
              }
            }
          }
        }
      }
    }
  }
};

const outputFile = path.join(__dirname, '../../swagger-output.json');
const endpointsFiles = [
  path.join(__dirname, '../routes/auth.routes.ts'),
  path.join(__dirname, '../routes/admin.routes.ts'),
  path.join(__dirname, '../routes/product.routes.ts'),
  path.join(__dirname, '../routes/cart.routes.ts'),
  path.join(__dirname, '../routes/order.routes.ts')
];

// Generate swagger.json
swaggerAutogen({
  openapi: '3.0.0',
  autoHeaders: true,
  autoQuery: true,
  autoBody: true,
  autoResponse: true,
  autoResponseData: true,
  autoResponseExamples: true,
  autoResponseHeaders: true,
  autoResponseStatus: true,
  autoResponseType: true,
  autoResponseSchema: true,
  autoResponseDescription: true,
  autoResponseContent: true,
  autoResponseContentType: true,
  autoResponseContentSchema: true,
  autoResponseContentExample: true,
  autoResponseContentDescription: true,
  autoResponseContentTypeSchema: true,
  autoResponseContentTypeExample: true,
  autoResponseContentTypeDescription: true
})(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger documentation generated successfully!');
});

export { doc }; 