import * as dotenv from 'dotenv';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { productRouter } from './controller/product.routes';
import express, { Request, Response, NextFunction } from 'express';
import { customerRouter } from './controller/customer.routes';
import { orderRouter } from './controller/order.routes';
import { expressjwt } from 'express-jwt';
import helmet from 'helmet';
// import { cartRouter } from './controller/cart.routes';

const app = express();
app.use(helmet());
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             // Allow connections to own server and the external API.
//             connectSrc: [`'self'`, 'https://zenquotes.io/api/today']
//         }
//     })
// );

dotenv.config();
const port = process.env.APP_PORT || 3000;


app.use(cors({ origin: 'http://localhost:8080' }));
app.use(bodyParser.json());

app.use(
    expressjwt({
        // secret: process.env.JWT_SECRET, // Q&A This is shown in the video, but does not work.
        secret: `${process.env.JWT_SECRET}`,
        algorithms: ['HS256']
    }).unless({
        path: ['/api-docs', /^\/api-docs\/.*/, '/customers/login', '/customers/register', '/status', /^\/products\/.*/],
        // path: ['/api-docs', /^\/api-docs\/.*/, '/customers/login', '/customers/signup', '/status', '/products', /^\/products\/.*/],
        // path: ['/customers/login', '/customers/signup', '/status'],
    })
);

app.use('/products', productRouter);
app.use('/customers', customerRouter);
app.use('/orders', orderRouter);


app.get('/status', (req, res) => {
    res.json({ message: 'Back-end is running...' });
});


const swaggerOpts = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Courses API',
            version: '1.0.0',
        },
    },
    apis: ['./controller/*.routes.ts'],
};
const swaggerSpec = swaggerJSDoc(swaggerOpts);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ status: 'unauthorized', message: err.message });
    } 
    else if (err.name === 'CoursesError') {
        res.status(400).json({ status: 'domain error', message: err.message });
    } else {
        res.status(400).json({ status: 'application error', message: err.message });
    }
});


app.listen(port || 3000, () => {
    console.log(`Back-end is running on port ${port}.`);
});
