import { Cart } from "../model/cart";
import database from "./database";

const getActiveCartByCustomerId = async (customerId: number): Promise<Cart | null> => {
    try {
        const cartPrisma = await database.cart.findMany({ 
            include: { customer: true },
            where: {
                customerId: customerId,
                active: true
            }
         });
         if (cartPrisma.length > 1) throw new Error("More than one cart is active in the database."); // Q&A Exceptionally throwing errors here, because it fits most. A: its fine
         return cartPrisma ? Cart.from(cartPrisma[0]) : null;
         
    } catch (error) {
        console.log(error);
        throw new Error('Database error. See server logs for details.');
    }
};

const getCartById = async (id: number): Promise<Cart | null>  => {
    try {
        const cartPrisma = await database.cart.findUnique({ 
            include: { customer: true },
            where: {
                id: id
            }
         });
         return cartPrisma ? Cart.from(cartPrisma) : null;

    } catch (error) {
        console.log(error);
        throw new Error('Database error. See server logs for details.');
    }
};

const updateCart = async ({ id, totalPrice, active }: Cart): Promise<string> => {
    try {
        await database.cart.update({
            where: {
                id: id
            },
            data: {
                totalPrice: totalPrice,
                active: active,
                // customer: {
                //     connect: { id: customer.getId() }
                // }
            }
        });

        return "Cart updated successfully.";
    } catch (error) {
        console.log(error);
        throw new Error('Database error. See server logs for details.');
    }
};

const createActiveCartByCustomerId = async (customerId: number) => {
    try {
        await database.cart.create({
            data: {
                totalPrice: 0,
                active: true,
                customer: {
                    connect: { id: customerId }
                }
            }
        });

        return "Cart created successfully."
    } catch (error) {
        console.log(error);
        throw new Error('Database error. See server logs for details.'); 
    }
};

export default {
    getActiveCartByCustomerId,
    getCartById,
    updateCart,
    createActiveCartByCustomerId
};