import { UnauthorizedError } from "express-jwt";
import { Cart } from "../model/cart";
import { Customer } from "../model/customer";
import { Order } from "../model/order";
import cartDb from "../repository/cart.db";
import customerDb from "../repository/customer.db";
import orderDb from "../repository/order.db";
import { OrderInput } from "../types";
import cartService from "./cart.service";

const createOrder = async ({auth, date}: OrderInput): Promise<Order | null> => {

    // AUTHORIZATION
    const { username, role } = auth;
    if (!['customer'].includes(role)) throw new UnauthorizedError('credentials_required', { message: 'You are not authorized to access this resource.', }); 

    // GET
    if (!date) throw new Error("Date is required.");

    // Q&A Is this the way of using Input types? A: Modify the ORderINput just to satisfy these needs.
    // if (!customerInput) throw new Error("Customer's username is required.");
    if (!username) throw new Error("Customer's username is required.");
    const customer: Customer | null = await customerDb.getCustomerByUsername(username);
    if (!customer) throw new Error("Customer does not exist.");

    const cart: Cart | null = await cartDb.getActiveCartByCustomerId(customer.getId());
    if (!cart) throw new Error("Cart does not exist.");
    if (!cart.getActive()) throw new Error("Order with this cart has already been made.");
    
    const totalCartPrice: number = await cartService.getTotalCartPriceByCustomerUsername(auth);
    if (!totalCartPrice) throw new Error("Cart is empty.");

    // const orderWithSameCart: Order | null = await orderDb.getOrderByCartId(cart.getId());
    // if (orderWithSameCart) throw new Error("Order with this cart has already been made.");


    // CONNECT
    const order = new Order({cart, date, customer});

    // SAVE
    await cartService.createNewActiveCartAndDeactivateTheCurrentOne(cart);
    return await orderDb.createOrder(order);
};

export default {
    createOrder
};