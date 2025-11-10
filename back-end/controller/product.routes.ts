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
 *            name:
 *              type: string
 *              description: Product's name.
 *            price:
 *              type: number
 *              format: int64
 *            unit:
 *              type: string
 *              description: Product's unit (kg, L, piece,...).
 *            stock:
 *              type: number
 *              format: int64
 *            description:
 *              type: string
 *              description: Product's description.
 *            imagePath:
 *              type: string
 *              description: Product's image path.
 *            deleted:
 *              type: boolean
 *              description: Product's state, deleted or not.
 */
import express, { NextFunction, Request, Response } from 'express';
import { Product } from '../model/product';
import productService from '../service/product.service';
import { Auth, Role } from '../types';
import { LinkCache } from '../repository/redis-link.cache';
const productRouter = express.Router();

// Helper function to generate cache key
const generateCacheKey = (endpoint: string, auth: Auth | null, params: any = {}): string => {
    const username = auth?.username || 'anonymous';
    const paramString = Object.entries(params)
        .map(([key, value]) => `${key}:${value}`)
        .join(':');
    return `cache:${endpoint}:${username}:${paramString}`;
};

/**
 * @swagger
 * /products:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get a list of all products.
 *     responses:
 *          200:
 *              description: A list of all products.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Product'
 */
productRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as Request & { auth: Auth };
        if (!request.auth || !request.auth.username) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const cacheKey = generateCacheKey('products:get', request.auth);
        const cacheInstance = await LinkCache.getInstance();

        const cachedProducts = await cacheInstance.getLinkMapping(cacheKey);
        if (cachedProducts) {
            return res.status(200).json(JSON.parse(cachedProducts));
        }

        const products: Product[] = await productService.getAllProducts(request.auth);
        await cacheInstance.setLinkMapping(cacheKey, JSON.stringify(products));
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /products/search/{name}:
 *   get:
 *     summary: Get a list of all products by name containing and case insensitive.
 *     parameters:
 *          - in: path
 *            name: name
 *            schema:
 *              type: string
 *              required: false
 *              description: The name of the product.
 *              example: se
 *     responses:
 *          200:
 *              description: A list of all products, which names give a match.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Product'
 */
productRouter.get('/search/:name', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const name = String(req.params.name);
        const cacheKey = generateCacheKey('products:search', null, { name });
        const cacheInstance = await LinkCache.getInstance();

        const cachedProducts = await cacheInstance.getLinkMapping(cacheKey);
        if (cachedProducts) {
            return res.status(200).json(JSON.parse(cachedProducts));
        }

        const products: Product[] =
            await productService.getProductsByNameContainingAndCaseInsensitive(name);
        await cacheInstance.setLinkMapping(cacheKey, JSON.stringify(products));
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /products/{name}:
 *   get:
 *     summary: Get a product by its name.
 *     parameters:
 *          - in: path
 *            name: name
 *            schema:
 *              type: string
 *              required: true
 *              description: The name of the product.
 *              example: Bread
 *     responses:
 *       200:
 *         description: A product object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
productRouter.get('/:name', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const name = String(req.params.name);
        const cacheKey = generateCacheKey('products:get:name', null, { name });
        const cacheInstance = await LinkCache.getInstance();

        const cachedProduct = await cacheInstance.getLinkMapping(cacheKey);
        if (cachedProduct) {
            return res.status(200).json(JSON.parse(cachedProduct));
        }

        const product: Product | null = await productService.getProductByName(name);
        await cacheInstance.setLinkMapping(cacheKey, JSON.stringify(product));
        res.status(200).json(product);
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

export { productRouter };
