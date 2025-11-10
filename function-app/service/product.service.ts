import { UnauthorizedError } from "express-jwt";
import { CartContainsProduct } from "../model/cartContainsProduct";
import { Product } from "../model/product";
import cartContainsProductDb from "../repository/cartContainsProduct.db";
import productDb from "../repository/product.db";
import { Auth } from "../types";


// TODO tests.
const getAllProducts = async (auth: Auth): Promise<Product[]> => {

    // AUTHORIZATION
    const { username, role } = auth;
    if (!['customer', 'guest', 'admin'].includes(role)) throw new UnauthorizedError('credentials_required', { message: 'You are not authorized to access this resource.', }); 

    const deletedProducts: Product[] = await productDb.getAllProductsByDeleted(true);
    const notDeletedProducts: Product[] = await productDb.getAllProductsByDeleted(false);

    if (auth.role === 'admin') {
        return [...notDeletedProducts, ...deletedProducts];
    } else {
        return [...notDeletedProducts];
    }
}

const getProductByName = async (name: string): Promise<Product> => {
    const product: Product | null = await productDb.getProductByName(name);
    if (!product) throw new Error(`Product "${name}" does not exist.`);
    return product;
}

const getProductsByNameContainingAndCaseInsensitive = async (name: string): Promise<Product[]> => {
    if (name === '*') return await productDb.getAllProductsByDeleted(false);

    const products: Product[] = await productDb.getProductsByNameContainingAndCaseInsensitive(name);
    return products;
};

const getProductsByCartId = async (cartId: number): Promise<Product[]> => {
    if (!cartId) throw new Error("Cart ID is required.");


    const cartItems: CartContainsProduct[] | null = await cartContainsProductDb.getAllCartItemsByCartId(cartId);
    if (!cartItems) throw new Error("Cart is empty.");  // TODO add a test for this.
    const cartItemNames: string[] = cartItems.map((cartItem) => cartItem.getProduct().getName());

    const products: Product[] = [];
    for (let name of cartItemNames) {
        const product: Product | null = await productDb.getProductByName(name);
        if (!product) throw new Error("Product does not exist.");

        products.push(product);
    }

    return products;
}

export default {
    getAllProducts,
    getProductByName,
    getProductsByCartId,
    getProductsByNameContainingAndCaseInsensitive
};