import { Customer, Orderr } from "@/types";
import util from "@/util/util";

const placeOrder = async (order: Orderr) => {
    return await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/orders`,
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${util.getLoggedInCustomer().token}`
            },
            body: JSON.stringify(order)
        }
    );
};



const createOrUpdateCartItem = async (productName: string, change?: string) => {
    return await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/customers/cart/${productName}?change=${change}`,
        {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${util.getLoggedInCustomer().token}`
            }
        }
    );
};

const OrderService = {
    placeOrder
}

export default OrderService;