import  swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
openapi: '3.0.0',
info: {
title: 'My API',
version: '1.0.0',
description: 'My API Description',

},
components: {
    securitySchemes: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT', 
        },
    },
},
security: [{
    bearerAuth: [] 
}],
};

const options = {
swaggerDefinition,
apis: ['./src/routes/*.ts'], // Path to the API routes in your Node.js application
};

const swaggerSpec = swaggerJSDoc(options);
export  {swaggerSpec};