import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { withErrorHandling } from './helpers/function-wrapper';
import { extractVerifyDecodeJwtToken } from '../util/jwt';
import { Auth } from '../types';
import productService from '../service/product.service';
import { LinkCache } from '../repository/redis-link.cache';
import { getCacheKey, safelyUseCache } from '../util/cache-helpers';

export const getAllProducts = withErrorHandling(
    async (request: HttpRequest): Promise<HttpResponseInit> => {
        console.log('Processing GET /products request');
        console.log('Redis env vars:', {
            host: process.env.REDIS_HOST_NAME ? 'SET' : 'NOT SET',
            key: process.env.REDIS_ACCESS_KEY ? 'SET' : 'NOT SET',
            port: process.env.REDIS_PORT || '(default)',
        });

        const auth: Auth = extractVerifyDecodeJwtToken(request);
        if (!auth || !auth.username) {
            return { status: 401, jsonBody: { error: 'Unauthorized' } };
        }

        const cacheInstance = await LinkCache.getInstance();
        const cacheKey = getCacheKey.products.all(auth);

        // Include debug parameter check
        const includeCache = request.query.get('includeCache') === 'true';

        const { data: products, cacheInfo } = await safelyUseCache(cacheInstance, cacheKey, () =>
            productService.getAllProducts(auth),
        );

        // Return with or without cache info based on debug flag
        return {
            status: 200,
            // jsonBody: includeCache ? { data: products, cacheInfo } : products,
            jsonBody: products,
            headers: {
                'X-Cache': cacheInfo.fromCache ? 'HIT' : 'MISS',
                'X-Cache-Key': cacheInfo.key,
            },
        };
    },
);

export const searchProducts = withErrorHandling(
    async (request: HttpRequest): Promise<HttpResponseInit> => {
        console.log('Processing GET /products/search/{name} request');

        const name = request.params.name ?? '*';
        const cacheInstance = await LinkCache.getInstance();
        const cacheKey = getCacheKey.products.search(name);

        // Include debug parameter check
        const includeCache = request.query.get('includeCache') === 'true';

        const { data: products, cacheInfo } = await safelyUseCache(cacheInstance, cacheKey, () =>
            productService.getProductsByNameContainingAndCaseInsensitive(name),
        );

        return {
            status: 200,
            // jsonBody: includeCache ? { data: products, cacheInfo } : products,
            jsonBody: products,
            headers: {
                'X-Cache': cacheInfo.fromCache ? 'HIT' : 'MISS',
                'X-Cache-Key': cacheInfo.key,
            },
        };
    },
);

export const getProductByName = withErrorHandling(
    async (request: HttpRequest): Promise<HttpResponseInit> => {
        console.log('Processing GET /products/{name} request');

        const name = request.params.name;
        if (!name) {
            return { status: 400, jsonBody: { error: 'Product name is required' } };
        }

        const cacheInstance = await LinkCache.getInstance();
        const cacheKey = getCacheKey.products.byName(name);

        // Include debug parameter check
        const includeCache = request.query.get('includeCache') === 'true';

        const { data: product, cacheInfo } = await safelyUseCache(cacheInstance, cacheKey, () =>
            productService.getProductByName(name),
        );

        return {
            status: 200,
            // jsonBody: includeCache ? { data: product, cacheInfo } : product,
            jsonBody: product,
            headers: {
                'X-Cache': cacheInfo.fromCache ? 'HIT' : 'MISS',
                'X-Cache-Key': cacheInfo.key,
            },
        };
    },
);

// HTTP bindings remain the same
app.http('productsGetAll', {
    methods: ['GET'],
    route: 'products',
    authLevel: 'anonymous',
    handler: getAllProducts,
});

app.http('getProductByName', {
    methods: ['GET'],
    route: 'products/{name}',
    authLevel: 'anonymous',
    handler: getProductByName,
});

app.http('productsSearchByName', {
    methods: ['GET'],
    route: 'products/search/{name}',
    authLevel: 'anonymous',
    handler: searchProducts,
});
