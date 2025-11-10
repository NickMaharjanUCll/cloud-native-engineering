import { CartContainsProduct } from "../model/cartContainsProduct";
import { BatchPayload } from "../types";
import database from "./database";

const getAllCartItemsByCartId = async (cartId: number): Promise<CartContainsProduct[]> => {
    try {
        const cartItemsPrisma = await database.cartContainsProduct.findMany({
            include: { 
                cart: { include: { customer: true } }, 
                product: true
            },
            where: {
                cartId: cartId
            }
        });
        return cartItemsPrisma.map((cartItemPrisma) => CartContainsProduct.from(cartItemPrisma));

    } catch (error) {
        console.log(error);
        throw new Error('Database error. See server logs for details.');
    }
};

const getCartItemByCartIdAndProductName = async (cartId: number, productName: string): Promise<CartContainsProduct | null> => {
    try {
        const cartItemPrisma = await database.cartContainsProduct.findFirst({
            include: { 
                cart: { include: { customer: true } }, 
                product: true
            },
            where: {
                cartId: cartId,
                productName: productName
            }
        });
        return cartItemPrisma ? CartContainsProduct.from(cartItemPrisma) : null;

    } catch (error) {
        console.log(error);
        throw new Error('Database error. See server logs for details.');
    }
};

const createOrUpdateCartItem = async ({ cart, product, quantity }: CartContainsProduct): Promise<CartContainsProduct | null> => {
    try {
        const result = await database.cartContainsProduct.create({ 
            data: {
                cart: {
                    connect: { id: cart.getId() }
                },
                product: {
                    connect: { name: product.getName() }
                },
                quantity: quantity
            },
            include: { 
                cart: { include: { customer: true } }, 
                product: true
            }
         });
         return result ? CartContainsProduct.from(result) : null;

    } catch (error) {
        console.log(error);
        throw new Error('Database error. See server logs for details.');
    }
};


const updateCartItem = async ({ cart, product, quantity }: CartContainsProduct): Promise<CartContainsProduct | null> => {
    try {
        const result = await database.cartContainsProduct.update({
            where: {
                cartId_productName: { // Compound primary key.
                    cartId: cart.getId(),
                    productName: product.getName()
                }
            },
            data: {
                quantity: quantity // Only quantity can be updated.
            },
            include: { 
                cart: { include: { customer: true } }, 
                product: true
            }
         });
         return result ? CartContainsProduct.from(result) : null;

    } catch (error) {
        console.log(error);
        throw new Error('Database error. See server logs for details.');
    }
};

// const deleteCartItemByCartIdAndProductName = (cartId: number | undefined, name: string): string | null => {
//     for (let i = 0; i < cartContainsProduct.length; i++) {
//         if (cartContainsProduct[i].getProduct().getName() === name && cartContainsProduct[i].getCart().getId() === cartId) {
//             cartContainsProduct.splice(i, 1);
//             return "Successfully deleted item from cart.";
//         }
//     }
//     return null
// };

const deleteCartItemByCartIdAndProductName = async (cartId: number, productName: string): Promise<CartContainsProduct> => {
    try {
        const cartItemPrisma = await database.cartContainsProduct.delete({
            include: { 
                cart: { include: { customer: true } }, 
                product: true
            },
            where: {
                cartId_productName: {
                    cartId: cartId,
                    productName: productName
                }
            }
        });
        // return cartItemsPrisma.map((cartItemPrisma) => CartContainsProduct.from(cartItemPrisma));
        // return "Deleted successfully.";
        return CartContainsProduct.from(cartItemPrisma);
    } catch (error) {
        console.log(error);
        throw new Error('Database error. See server logs for details.');  
    }
}

const deleteCartItemsByCartId = async (cartId: number): Promise<BatchPayload> => {
    try {
        const result: BatchPayload = await database.cartContainsProduct.deleteMany({
            where: {
                cartId: cartId
            }
        });
        return result;

    } catch (error) {
        console.log(error);
        throw new Error('Database error. See server logs for details.');
    }
};

export default {
    getAllCartItemsByCartId,
    getCartItemByCartIdAndProductName,
    createOrUpdateCartItem,
    deleteCartItemsByCartId,
    updateCartItem,
    deleteCartItemByCartIdAndProductName
}