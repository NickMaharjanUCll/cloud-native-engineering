import { Order } from "../model/order";
import database from "./database";

const createOrder = async ({cart, date, customer}: Order): Promise<Order | null> => {
    try {
        const result = await database.order.create({
            include: { 
                cart: { include: { customer: true } }, 
                customer: true
            },
            data: {
                cart: {
                    connect: { id: cart.getId() }
                },
                date: date,
                customer: {
                    connect: { id: customer.getId() }
                }
            }
        });
        return result ? Order.from(result) : null;

    } catch (error) {
        console.log(error);
        throw new Error('Database error. See server logs for details.');
    }
};

// const getOrderByCartId = async (cartId: number): Promise<Order | null> => {
//         try {
//             const orderPrisma = await database.order.findUnique({
//                 include: {
//                     cart: { include: { customer: true } }, 
//                     customer: true
//                 },
//                 where: {
//                     cartId: cartId
//                 }
//             });

//             return orderPrisma ? Order.from(orderPrisma) : null;
//         } catch (error) {
//             console.log(error);
//             throw new Error('Database error. See server logs for details.');
//         }
// };

const getOrdersByCustomerId = async (customerId: number): Promise<Order[] | null> => {
            try {
                const ordersPrisma = await database.order.findMany({
                    include: {
                        cart: { include: { customer: true } }, 
                        customer: true
                    },
                    where: {
                        customerId: customerId
                    }
                });
    
                return ordersPrisma.map((orderPrisma) => Order.from(orderPrisma));
                
            } catch (error) {
                console.log(error);
                throw new Error('Database error. See server logs for details.');
            }
    };

export default {
    createOrder,
    getOrdersByCustomerId
};