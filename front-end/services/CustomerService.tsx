import { Customer } from "@/types";
import util from "@/util/util";

const clearCart = async () => {
    
    return await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/customers/cart`,
        {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${util.getLoggedInCustomer().token}`
            }
        }
    );
};

const deleteCartItem = async (productName: string) => {
    return await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/customers/cart/${productName}`,
        {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${util.getLoggedInCustomer().token}`
            }
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


const getCartItemsByCustomerUsername = async () => {
    return await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/customers/cart`,
        {
            method:"GET",
            headers:{
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${util.getLoggedInCustomer().token}`
            }
        }
    );
}

const getOrdersByCustomerUsername = async () => {
    return await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/orders/customer`,
        {
            method:"GET",
            headers:{
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${util.getLoggedInCustomer().token}`
            }
        }
    );
}

const getTotalCartPriceByCustomerUsername = async () => {
    return await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/customers/cart/totalPrice`,
        {
            method:"GET",
            headers:{
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${util.getLoggedInCustomer().token}`
            }
        }
    );
};

const loginCustomer = async (customer: Customer) => {
    return await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/customers/login`,
        {
            method:"POST",
            headers:{
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(customer),
        }
    );
};

const registerCustomer = async (customer: Customer) => {
    return await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/customers/register`,
        {
            method:"POST",
            headers:{
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(customer),
        }
    );
};

const CustomerService = {
    clearCart,
    createOrUpdateCartItem,
    getCartItemsByCustomerUsername,
    deleteCartItem,
    getTotalCartPriceByCustomerUsername,
    loginCustomer,
    registerCustomer,
    getOrdersByCustomerUsername
}

export default CustomerService;