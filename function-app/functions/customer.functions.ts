import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { Auth, BatchPayload, ChangeQuantity, CustomerInput } from '../types';
import customerService from '../service/customer.service';
import { withErrorHandling } from './helpers/function-wrapper';
import cartService from '../service/cart.service';
import { extractVerifyDecodeJwtToken } from '../util/jwt';
import cartItemService from '../service/cartItem.service';
import { CartContainsProduct } from '../model/cartContainsProduct';
import { LinkCache } from '../repository/redis-link.cache';
import { getCacheKey, invalidateCacheKeys, safelyUseCache } from '../util/cache-helpers';

export const login = withErrorHandling(
    async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        console.log('Processing POST /customers/login request');

        const body = await request.text();
        const customerInput: CustomerInput = JSON.parse(body);
        const response = await customerService.authenticate(customerInput);

        // No caching for login, as authentication should always be verified
        return { status: 200, jsonBody: { message: 'Authentication successful.', ...response } };
    },
);

export const cartTotalPrice = withErrorHandling(
    async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        console.log('Processing GET /customers/cart/totalPrice request');

        const auth: Auth = extractVerifyDecodeJwtToken(request);
        if (!auth || !auth.username) {
            return { status: 401, jsonBody: { error: 'Unauthorized' } };
        }

        const cacheInstance = await LinkCache.getInstance();
        const cacheKey = getCacheKey.cart.totalPrice(auth);
        const includeCache = request.query.get('includeCache') === 'true';

        const { data: totalPrice, cacheInfo } = await safelyUseCache(cacheInstance, cacheKey, () =>
            cartService.getTotalCartPriceByCustomerUsername(auth),
        );

        return {
            status: 200,
            // jsonBody: includeCache ? { totalPrice, cacheInfo } : { totalPrice },
            jsonBody: totalPrice,
            headers: {
                'X-Cache': cacheInfo.fromCache ? 'HIT' : 'MISS',
                'X-Cache-Key': cacheInfo.key,
            },
        };
    },
);

export const createOrUpdateCartItem = withErrorHandling(
    async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        console.log('Processing PUT /customers/cart/{productName} request');

        const auth: Auth = extractVerifyDecodeJwtToken(request);
        if (!auth || !auth.username) {
            return { status: 401, jsonBody: { error: 'Unauthorized' } };
        }

        const productName: string = String(request.params.productName);
        const change: ChangeQuantity =
            (String(request.query.get('change')) as ChangeQuantity) || 'increase';

        const cacheInstance = await LinkCache.getInstance();

        // Identify keys to invalidate
        const keysToInvalidate = [
            getCacheKey.cart.get(auth),
            getCacheKey.cart.totalPrice(auth),
            getCacheKey.cart.item(auth, productName),
        ];

        // Invalidate related caches
        await invalidateCacheKeys(cacheInstance, keysToInvalidate);

        // Update cart item
        const updatedItem = await cartItemService.createOrUpdateCartItem(auth, productName, change);

        // Cache the updated item
        const itemCacheKey = getCacheKey.cart.item(auth, productName);
        await cacheInstance.setLinkMapping(itemCacheKey, JSON.stringify(updatedItem));

        return {
            status: 200,
            jsonBody: {
                item: updatedItem,
                cacheInvalidated: keysToInvalidate,
            },
        };
    },
);

export const deleteItemFromCart = withErrorHandling(
    async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        console.log('Processing DELETE /customers/cart/{productName} request');

        const auth: Auth = extractVerifyDecodeJwtToken(request);
        if (!auth || !auth.username) {
            return { status: 401, jsonBody: { error: 'Unauthorized' } };
        }

        const productName: string = String(request.params.productName);

        const cacheInstance = await LinkCache.getInstance();

        // Identify keys to invalidate
        const keysToInvalidate = [
            getCacheKey.cart.get(auth),
            getCacheKey.cart.totalPrice(auth),
            getCacheKey.cart.item(auth, productName),
        ];

        // Invalidate related caches
        await invalidateCacheKeys(cacheInstance, keysToInvalidate);

        // Delete the item
        const response: CartContainsProduct =
            await cartItemService.deleteCartItemByCustomerUsernameAndProductName(auth, productName);

        return {
            status: 200,
            jsonBody: {
                response,
                cacheInvalidated: keysToInvalidate,
            },
        };
    },
);

export const getCart = withErrorHandling(
    async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        console.log('Processing GET /customers/cart request');

        const auth: Auth = extractVerifyDecodeJwtToken(request);
        if (!auth || !auth.username) {
            return { status: 401, jsonBody: { error: 'Unauthorized' } };
        }

        const cacheInstance = await LinkCache.getInstance();
        const cacheKey = getCacheKey.cart.get(auth);
        const includeCache = request.query.get('includeCache') === 'true';

        const { data: cartItems, cacheInfo } = await safelyUseCache(cacheInstance, cacheKey, () =>
            cartItemService.getCartItemsByCustomerUsername(auth),
        );

        return {
            status: 200,
            // jsonBody: includeCache ? { cartItems, cacheInfo } : { cartItems },
            jsonBody: cartItems,
            headers: {
                'X-Cache': cacheInfo.fromCache ? 'HIT' : 'MISS',
                'X-Cache-Key': cacheInfo.key,
            },
        };
    },
);

export const deleteAllItemsFromCart = withErrorHandling(
    async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        console.log('Processing DELETE /customers/cart request');

        const auth: Auth = extractVerifyDecodeJwtToken(request);
        if (!auth || !auth.username) {
            return { status: 401, jsonBody: { error: 'Unauthorized' } };
        }

        const cacheInstance = await LinkCache.getInstance();

        // Identify keys to invalidate
        const keysToInvalidate = [getCacheKey.cart.get(auth), getCacheKey.cart.totalPrice(auth)];

        // Invalidate related caches
        await invalidateCacheKeys(cacheInstance, keysToInvalidate);

        // Clear the cart
        const response: BatchPayload =
            await cartItemService.deleteCartItemsByCustomerUsername(auth);

        return {
            status: 200,
            jsonBody: {
                response,
                cacheInvalidated: keysToInvalidate,
            },
        };
    },
);

export const register = withErrorHandling(
    async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        console.log('Processing POST /customers/register request');

        const body = await request.text();
        const customerInput: CustomerInput = JSON.parse(body);

        const cacheInstance = await LinkCache.getInstance();
        const customerCacheKey = getCacheKey.customer.profile(customerInput.username);

        // Invalidate any existing customer cache
        await invalidateCacheKeys(cacheInstance, [customerCacheKey]);

        // Create the customer
        const createdCustomer = await customerService.createCustomer(customerInput);

        // Cache the created customer
        await cacheInstance.setLinkMapping(customerCacheKey, JSON.stringify(createdCustomer));

        return {
            status: 200,
            jsonBody: {
                customer: createdCustomer,
                cachedAt: customerCacheKey,
            },
        };
    },
);

// Route definitions remain unchanged
app.http('customersLogin', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'customers/login',
    handler: login,
});

app.http('cartTotalPrice', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'customers/cart/totalPrice',
    handler: cartTotalPrice,
});

app.http('createOrUpdateCartItem', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'customers/cart/{productName}',
    handler: createOrUpdateCartItem,
});

app.http('deleteItemFromCart', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'customers/cart/{productName}',
    handler: deleteItemFromCart,
});

app.http('getCart', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'customers/cart',
    handler: getCart,
});

app.http('deleteAllItemsFromCart', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'customers/cart',
    handler: deleteAllItemsFromCart,
});

app.http('customersRegister', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'customers/register',
    handler: register,
});
