import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { withErrorHandling } from './helpers/function-wrapper';
import { Auth, OrderInput } from '../types';
import { extractVerifyDecodeJwtToken } from '../util/jwt';
import orderService from '../service/order.service';
import { Order } from '../model/order';
import { LinkCache } from '../repository/redis-link.cache'; // Adjust path to common folder

export const postOrder = withErrorHandling(
    async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        context.log('Processing POST /orders');

        const auth: Auth = extractVerifyDecodeJwtToken(request);
        if (!auth || !auth.username) {
            return { status: 401, jsonBody: { error: 'Unauthorized' } };
        }

        const body = await request.text();
        context.log(`Request body: ${body}`);

        const orderInput: OrderInput = JSON.parse(body);
        context.log(`Parsed orderInput: ${JSON.stringify(orderInput)}`);

        orderInput.auth = auth;
        context.log(`orderInput with auth: ${JSON.stringify(orderInput)}`);

        // Invalidate related caches
        const cacheInstance = await LinkCache.getInstance();
        const cartCacheKey = `cache:cart:get:${auth.username}`;
        const ordersCacheKey = `cache:orders:get:${auth.username}`;
        await cacheInstance.setLinkMapping(cartCacheKey, JSON.stringify(null));
        await cacheInstance.setLinkMapping(ordersCacheKey, JSON.stringify(null));

        const response: Order = await orderService.createOrder(orderInput);

        // Optionally cache the created order
        // const orderCacheKey = `cache:orders:${auth.username}:${orderInput.date}`;
        // await cacheInstance.setLinkMapping(orderCacheKey, JSON.stringify(response));

        return { status: 200, jsonBody: { response } };
    },
);

export const getOrdersByCustomerUsername = withErrorHandling(
    async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        console.log('Processing GET /orders/customer request');

        const auth: Auth = extractVerifyDecodeJwtToken(request);
        if (!auth || !auth.username) {
            return { status: 401, jsonBody: { error: 'Unauthorized' } };
        }

        const cacheInstance = await LinkCache.getInstance();
        const cacheKey = `cache:orders:get:${auth.username}`;

        // Include debug parameter check
        const includeCache = request.query.get('includeCache') === 'true';

        // Try to get from cache first
        console.log(`[Cache] Attempting to retrieve from cache: ${cacheKey}`);
        const cachedData = await cacheInstance.getLinkMapping(cacheKey);

        let orders: Order[];
        let cacheInfo = {
            fromCache: false,
            key: cacheKey,
            timestamp: new Date().toISOString(),
        };

        if (cachedData !== 'null') {
            // Cache hit
            console.log(`[Cache] HIT: Found data in cache for key: ${cacheKey}`);
            orders = JSON.parse(cachedData);
            cacheInfo.fromCache = true;
        } else {
            // Cache miss
            console.log(`[Cache] MISS: No data found in cache for key: ${cacheKey}`);
            console.log(`[Cache] Fetching data from database for key: ${cacheKey}`);

            const startTime = Date.now();
            orders = await orderService.getOrdersByCustomerUsername(auth);
            const fetchTime = Date.now() - startTime;

            console.log(`[Cache] Database fetch completed in ${fetchTime}ms`);

            // Cache the data
            console.log(`Caching data with key: ${cacheKey}`);
            await cacheInstance.setLinkMapping(cacheKey, JSON.stringify(orders));
            console.log(`[Cache] Successfully cached data for key: ${cacheKey} (TTL: 600s)`);
        }

        console.log(
            `[Cache] Total operation time: ${Date.now() - new Date(cacheInfo.timestamp).getTime()}ms`,
        );

        return {
            status: 200,
            // jsonBody: includeCache ? { data: orders, cacheInfo } : { orders },
            jsonBody: orders,
            headers: {
                'X-Cache': cacheInfo.fromCache ? 'HIT' : 'MISS',
                'X-Cache-Key': cacheInfo.key,
            },
        };
    },
);
app.http('postOrder', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'orders',
    handler: postOrder,
});

app.http('getOrdersByCustomerUsername', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'orders/customer',
    handler: getOrdersByCustomerUsername,
});
