/**
 * @swagger
 *   components:
 *    securitySchemes:
 *     bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *    schemas:
 *      OrderInput:
 *          type: object
 *          properties:
 *              date:
 *                  type: string
 *                  format: date-time
 *      Order:
 *          type: object
 *          properties:
 *              cart:
 *                  $ref: '#/components/schemas/Cart'
 *              date:
 *                  type: string
 *                  format: date-time
 *              customer:
 *                  $ref: '#/components/schemas/Customer' 
 *      Cart:
 *          type: object
 *          properties:
 *              id:
 *                  type: number
 *                  format: int64
 *                  example: 1
 *              totalPrice:
 *                  type: number
 *                  format: int64
 *                  example: 50
 *              active:
 *                  type: boolean
 *                  example: true
 *              customer:
 *                  $ref: '#/components/schemas/Customer'
 *      Customer:
 *          type: object
 *          properties:
 *              id:
 *                  type: number
 *                  format: int64
 *              password:
 *                  type: string
 *                  description: Customer's password.
 *              securityQuestion:
 *                  type: string
 *                  description: Customer's security question.
 *              username:
 *                  type: string
 *                  description: Customer's username.
 *              firstName:
 *                  type: string
 *                  description: Customer's first name.
 *              lastName:
 *                  type: string
 *                  description: Customer's last name.
 *              phone:
 *                  type: number
 *                  format: int64
*              role:
 *                  type: string
 *                  description: Customer's role. Can be either 'customer', 'admin' or 'guest'.
 *                  example: customer
 */

import express, { NextFunction, Request, Response } from 'express';
import orderService from '../service/order.service';
import { OrderInput, Role } from '../types';
import { LinkCache } from '../repository/redis-link.cache'; 

const orderRouter = express.Router();

/**
 * @swagger
 * /orders:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     summary: Create (place) an order.
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/OrderInput'
 *     responses:
 *       200:
 *         description: Message indicating success.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
orderRouter.post('/customers/orders', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Authentication: Extract auth from JWT
        const request = req as Request & { auth: { username: string; role: Role } };
        if (!request.auth || !request.auth.username) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Prepare order input
        const orderInput = <OrderInput>req.body;
        orderInput.auth = request.auth; // Attach auth info (username from JWT)

        // Invalidate related caches (e.g., customer's cart or order history)
        const cacheInstance = await LinkCache.getInstance();
        const cartCacheKey = `cache:cart:get:${request.auth.username}`;
        const ordersCacheKey = `cache:orders:get:${request.auth.username}`;
        await cacheInstance.setLinkMapping(cartCacheKey, JSON.stringify(null)); // Invalidate cart cache
        await cacheInstance.setLinkMapping(ordersCacheKey, JSON.stringify(null)); // Invalidate orders cache

        // Create order
        const result = await orderService.createOrder(orderInput);

        // Cache the created order (optional, depending on use case)
        const orderCacheKey = `cache:order:${request.auth.username}:${orderInput.date}`;
        await cacheInstance.setLinkMapping(orderCacheKey, JSON.stringify(result));

        // Return object (not string) as per Q&A
        res.status(200).json({ message: 'Order created successfully', order: result });
    } catch (error) {
        next(error);
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    const cacheInstance = await LinkCache.getInstance();
    await cacheInstance.quit();
    process.exit(0);
});
// Q&A Do we have to always return an object in result. Is just a plain string okay? A: Don't return string. 
// TODO This endpoint should be under customer and not using request body.

export { orderRouter };