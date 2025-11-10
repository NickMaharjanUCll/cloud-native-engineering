import { Cart } from "./cart";
import { Product } from "./product";
import {
    Cart as CartPrisma,
    Product as ProductPrisma,
    Customer as CustomerPrisma,
    CartContainsProduct as CartContainsProductPrisma
} from '@prisma/client';

export class CartContainsProduct {
    readonly cart: Cart;
    readonly product: Product;
    quantity: number; // Do not change the default value!

    constructor(cartContainsProduct: { cart: Cart, product: Product, quantity: number }) {
        this.validate(cartContainsProduct);

        this.cart = cartContainsProduct.cart;
        this.product = cartContainsProduct.product;
        this.quantity = cartContainsProduct.quantity;
    }

    validate(cartContainsProduct: { cart: Cart, product: Product, quantity: number }) {
        if (!cartContainsProduct.cart) throw new Error("Cart is required."); 
        if (!cartContainsProduct.product) throw new Error('Product name is required.');
        if (cartContainsProduct.quantity <= 0) throw new Error("Quantity must be positive.");
    }

    static from({
        cart,
        product,
        quantity
    // }: CartContainsProductPrisma & { cart: CartPrisma & { customer: CustomerPrisma }; product: ProductPrisma }) {
    }: CartContainsProductPrisma & { cart: CartPrisma & { customer: CustomerPrisma }; product: ProductPrisma }) {
        return new CartContainsProduct({
            cart: Cart.from(cart),
            product: Product.from(product),
            quantity
        });
    };

    getCart(): Cart {
        return this.cart;
    }

    getProduct(): Product {
        return this.product
    }

    getQuantity(): number {
        return this.quantity;
    }

    setQuantity(quantity: number): void {
        if (quantity <= 0) throw new Error("Quantity must be positive."); // Q&A Validation is done twice!? A: Create another function to call in validate and also call it here.
        this.quantity = quantity;
    }
}