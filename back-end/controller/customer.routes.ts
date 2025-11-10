/**
 * @swagger
 *   components:
 *    securitySchemes:
 *     bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *    schemas:
 *      Product:
 *          type: object
 *          properties:
 *              name:
 *                  type: string
 *                  example: Bananas
 *              price:
 *                  type: number
 *                  example: 5
 *              unit:
 *                  type: string
 *                  example: bunch
 *              stock:
 *                  type: number
 *                  example: 10
 *              description:
 *                  type: string
 *                  example: Banana is a fruit.
 *              imagePath:
 *                  type: string
 *              deleted:
 *                  type: boolean
 *                  description: Indicator whether a product should not be displayed in the Front-End.
 *                  example: false
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
 *      CartContainsProduct:
 *          type: object
 *          properties:
 *            cart:
 *              $ref: '#/components/schemas/Cart'
 *            product:
 *              $ref: '#/components/schemas/Product'
 *            quantity:
 *              type: number
 *              format: int64
 *              example: 5
 *      OrderInput:
 *          type: object
 *          properties:
 *              date:
 *                  type: date-time
 *                  format: date-time    
 *      CustomerInput:
 *          type: object
 *          properties:
 *              password:
 *                  type: string
 *                  description: Customer's password.
 *                  example: m@t3j-v3s3l
 *              securityQuestion:
 *                  type: string
 *                  description: Customer's security question.
 *                  example: What is the name of the best friend from childhood?
 *              username:
 *                  type: string
 *                  description: Customer's username.
 *                  example: Matej444
 *              firstName:
 *                  type: string
 *                  description: Customer's first name.
 *                  example: Matej
 *              lastName:
 *                  type: string
 *                  description: Customer's last name.
 *                  example: Vesel
 *              phone:
 *                  type: number
 *                  format: int64
 *                  example: 12345678
 *              role:
 *                  type: string
 *                  description: Customer's role. Can be either 'customer', 'admin' or 'guest'.
 *                  example: customer
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
 *      AuthenticationRequest:
 *          type: object
 *          properties:
 *              username:
 *                  type: string
 *                  description: Customer's username
 *                  example: Matej333
 *              password:
 *                  type: string
 *                  description: Customer's password
 *                  example: m@t3j-v3s3l
 *      AuthenticationResponse:
 *          type: object
 *          properties:
 *              token:
 *                  type: string
 *                  description: Customer's token.
 *              username:
 *                  type: string
 *                  description: Customer's username.
 *              fullname:
 *                  type: string
 *                  description: Customer's fullname.
 *      BatchPayload:
 *          type: object
 *          properties:
 *              count:
 *                  type: number
 *                  format: int64
 *                  example: 5
 *                  description: Number of items deleted from cart.
 */


import express, { NextFunction, Request, Response } from 'express';
import { expressjwt, Request as JWTRequest } from "express-jwt";
import { CartContainsProduct } from '../model/cartContainsProduct';
import cartItemService from '../service/cartItem.service';
import cartService from '../service/cart.service';
import { Auth, BatchPayload, ChangeQuantity, CustomerInput, Role } from '../types';
import customerService from '../service/customer.service';
import { LinkCache } from '../repository/redis-link.cache'; 
let cacheInstance: LinkCache;

(async () => {
    cacheInstance = await LinkCache.getInstance();
})();

// Helper function to generate cache key
const generateCacheKey = (endpoint: string, auth: Auth, params: any = {}): string => {
    const paramString = Object.entries(params)
        .map(([key, value]) => `${key}:${value}`)
        .join(':');
    return `cache:${endpoint}:${auth.username}:${paramString}`;
};
const customerRouter = express.Router();

/**
 * @swagger
 * /customers/cart/{productName}:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete an item from a cart.
 *     parameters:
 *          - in: path
 *            name: productName
 *            schema:
 *              type: string
 *              required: true
 *              description: Product's name.
 *              example: Bananas
 *     responses:
 *       200:
 *         description: A CartContainsProduct object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartContainsProduct'
 */
customerRouter.delete('/cart/:productName', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as Request & { auth: Auth };
        const productName: string = String(req.params.productName);
        const cacheKey = generateCacheKey('cart:delete:product', request.auth, { productName });

        // Invalidate cache for this cart item
        await cacheInstance.setLinkMapping(cacheKey, JSON.stringify(null));

        const result: CartContainsProduct = await cartItemService.deleteCartItemByCustomerUsernameAndProductName(request.auth, productName);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /customers/cart:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete all items (products) from a cart.
 *     responses:
 *       200:
 *         description: Number of deleted cart items.
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/BatchPayload'
 */
customerRouter.delete('/cart', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as Request & { auth: Auth };
        const cacheKey = generateCacheKey('cart:delete:all', request.auth);

        // Invalidate cache for all cart items
        await cacheInstance.setLinkMapping(cacheKey, JSON.stringify(null));

        const result: BatchPayload = await cartItemService.deleteCartItemsByCustomerUsername(request.auth);
        res.json(result);
    } catch (error) {
        next(error);
    }
});
/**
 * @swagger
 * /customers/cart/{productName}?change:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Add a product to cart or change it's quantity.
 *     parameters:
 *          - in: path
 *            name: productName
 *            schema:
 *              type: string
 *              required: true
 *              description: Product's name.
 *              example: Bananas 
 *          - in: query
 *            name: change
 *            schema:
 *              type: string
 *              enum: [increase, decrease]
 *              required: false
 *              description: Specify whether to 'increase' or 'decrease' the cart item.
 *              example: increase
 *     responses:
 *       200:
 *         description: Updated cart item (CartContainsProduct object).
 *         content:
 *           application/json:
 *             schema:
 *                  $ref: '#/components/schemas/CartContainsProduct'
 */
customerRouter.put('/cart/:productName', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as Request & { auth: { username: string; role: Role } };
        const productName: string = String(req.params.productName);
        const change: ChangeQuantity = (String(req.query.change) as ChangeQuantity) || 'increase';
        const cacheKey = generateCacheKey('cart:put:product', request.auth, { productName, change });

        // Check cache
        const cachedResult = await cacheInstance.getLinkMapping(cacheKey);
        if (cachedResult) {
            return res.status(200).json(JSON.parse(cachedResult));
        }

        // Fetch from service and cache
        const result = await cartItemService.createOrUpdateCartItem(request.auth, productName, change);
        await cacheInstance.setLinkMapping(cacheKey, JSON.stringify(result));
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});
// https://www.baeldung.com/rest-http-put-vs-post




/**
 * @swagger
 * /customers/cart:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get cart items of a customer. (Get CartContainsProduct objects using customer's username.)
 *     responses:
 *       200:
 *         description: A list of CartContainsProduct objects.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartContainsProduct'
 */
// customerRouter.get('/cart', async (req: JWTRequest, res: Response, next: NextFunction) => {
    customerRouter.get('/cart', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = req as Request & { auth: Auth };
            const cacheKey = generateCacheKey('cart:get', request.auth);
    
            // Check cache
            const cachedCart = await cacheInstance.getLinkMapping(cacheKey);
            if (cachedCart) {
                return res.status(200).json(JSON.parse(cachedCart));
            }
    
            // Fetch from service and cache
            const cart: CartContainsProduct[] = await cartItemService.getCartItemsByCustomerUsername(request.auth);
            await cacheInstance.setLinkMapping(cacheKey, JSON.stringify(cart));
            res.status(200).json(cart);
        } catch (error) {
            next(error);
        }
    });

/**
 * @swagger
 * /customers/cart/totalPrice:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get total price of a cart.
 *     responses:
 *       200:
 *         description: Total price of the cart.
 *         content:
 *           application/json:
 *             type: number
 *             example: 500
 */
customerRouter.get('/cart/totalPrice', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as Request & { auth: Auth };
        const cacheKey = generateCacheKey('cart:totalPrice', request.auth);

        // Check cache
        const cachedPrice = await cacheInstance.getLinkMapping(cacheKey);
        if (cachedPrice) {
            return res.status(200).json(JSON.parse(cachedPrice));
        }

        // Fetch from service and cache
        const totalCartPrice: number = await cartService.getTotalCartPriceByCustomerUsername(request.auth);
        await cacheInstance.setLinkMapping(cacheKey, JSON.stringify(totalCartPrice));
        res.status(200).json(totalCartPrice);
    } catch (error) {
        next(error);
    }
});


// /**
//  * @swagger
//  * /customers/{username}/cart/order/{date}:
//  *   post:
//  *     security:
//  *      - bearerAuth: []
//  *     summary: Create (place) an order. Better alternative to /order.
//  *     parameters:
//  *          - in: path
//  *            name: username
//  *            schema:
//  *              type: string
//  *              required: true
//  *              description: Customer's username
//  *              example: Matej333
//  *          - in: path
//  *            name: date
//  *            schema:
//  *              type: string
//  *              format: date-time
//  *              required: true
//  *              description: Order's date.
//  *              example: 2019-01-19 14:00:12
//  *     responses:
//  *       200:
//  *         description: Message indicating success.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: string
//  *               example: Order placed successfully.
//  */
// customerRouter.post('/:username/cart/order/:date', async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const customerUsername: string = String(req.params.username);
//         const date: string = String(req.params.date);

//         const order: OrderInput = { 
//             customer: { username: customerUsername },
//             date: new Date(date)
//         };

//         const result = await orderService.createOrder(order);
//         res.status(200).json(result);

//     } catch (error) {
//         next(error);
//     }
// })


/**
 * @swagger
 * /customers/register:
 *  post:
 *      summary: Create a customer.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/CustomerInput'
 *      responses:
 *          200:
 *              description: The created customer object.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Customer'
 */
customerRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerInput = <CustomerInput>req.body;
        const customer = await customerService.createCustomer(customerInput);
        res.status(200).json(customer);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /customers/login:
 *  post:
 *      summary: Login using username and password. Returns an object with JWT token and user name when successful.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/AuthenticationRequest'
 *      responses:
 *          200:
 *              description: The created customer object.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/AuthenticationResponse'
 *          401:
 *              description: Error indicating wrong password.
 *              content:
 *                  application/json:
 *                      schema:
 *                          string: Wrong credentials.
 */
customerRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerInput = <CustomerInput>req.body;
        const response = await customerService.authenticate(customerInput);
        res.status(200).json({ message: 'Authentication successful.', ...response });
    } catch (error) {
        next(error);
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    await cacheInstance.quit();
    process.exit(0);
});

export { customerRouter };

// Q&A Do we need to have functionality to register sb in the system via front-end? A: yes.
// Q&A • OK There is at least 1 functional form with validation, error handling and integration with the back-end. • There is at least 1 login form with validation and error handling.  A: You need two forms.
// TODO always return the object. It is a contract.