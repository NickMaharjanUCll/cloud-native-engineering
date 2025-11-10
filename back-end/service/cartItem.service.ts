import { UnauthorizedError } from "express-jwt";
import { Cart } from "../model/cart";
import { CartContainsProduct } from "../model/cartContainsProduct";
import { Customer } from "../model/customer";
import { Product } from "../model/product";
import cartDb from "../repository/cart.db";
import cartContainsProductDb from "../repository/cartContainsProduct.db";
import customerDb from "../repository/customer.db";
import productDb from "../repository/product.db";
import { Auth, BatchPayload } from "../types";


const getCartItemsByCustomerUsername = async (auth: Auth): Promise<Array<CartContainsProduct>> => {

    // AUTHORIZATION
    const { username, role } = auth;
    if (!['customer'].includes(role)) throw new UnauthorizedError('credentials_required', { message: 'You are not authorized to access this resource.', }); 

    
    if (!username) throw new Error("Customer's username is required." + username);
    const customer: Customer | null = await customerDb.getCustomerByUsername(username);
    if (!customer) throw new Error("Customer does not exist"); // TODO add a test.

    const cart: Cart | null = await cartDb.getActiveCartByCustomerId(customer.getId());
    if (!cart) throw new Error("Cart does not exist.");

    return await cartContainsProductDb.getAllCartItemsByCartId(cart.getId());
};

// FINAL code:
// const getCartItemsByCustomerUsername = async ({ customerUsername, role }): Promise<Array<CartContainsProduct>> => {
//     if (role === "admin") {
//         return ...;
//     } else if (role === "customer") {
//         return ...;
//     } else if (role === "guest") {
//         throw new UnauthorizedError("credentials_required", {
//             message: "You are not authorized to access this resource."
//         })
//     }
// };

const createOrUpdateCartItem = async (auth: Auth, productName: string, change?: string): Promise<CartContainsProduct | null> => {

    // AUTHORIZATION
    const { username, role } = auth;
    if (!['customer'].includes(role)) throw new UnauthorizedError('credentials_required', { message: 'You are not authorized to access this resource.', }); 


    // GET
    if (!username) throw new Error("Customer's username is required.");
    const customer: Customer | null = await customerDb.getCustomerByUsername(username);
    if (!customer) throw new Error("Customer does not exist.");

    const cart: Cart | null = await cartDb.getActiveCartByCustomerId(customer.getId());
    if (!cart) throw new Error("Cart does not exist.");

    if (!productName) throw new Error("Product name is required.");
    const product: Product | null = await productDb.getProductByName(productName);
    if (!product) throw new Error("Product does not exist.");

    let cartItem: CartContainsProduct | null = await cartContainsProductDb.getCartItemByCartIdAndProductName(cart.getId(), product.getName());


    // CONNECT & SAVE
    // Create or Update
    if (!cartItem) {
        cartItem = new CartContainsProduct({ cart, product, quantity: 1 }); // connect
        product.setStock(cartItem.product.getStock() - 1); // connect
        await productDb.updateProductStockByName(product.getName(), product.getStock()); // save
        return await cartContainsProductDb.createOrUpdateCartItem(cartItem); // save
    } else {
        if (change === "increase") {
            product.setStock(cartItem.product.getStock() - 1); // connect
            cartItem.setQuantity(cartItem.getQuantity() + 1); // connect
        }
        if (change === "decrease") {
            product.setStock(cartItem.product.getStock() + 1); // connect
            cartItem.setQuantity(cartItem.getQuantity() - 1); // connect
        }
        await productDb.updateProductStockByName(product.getName(), product.getStock()); // save
        return await cartContainsProductDb.updateCartItem(cartItem); // save
    }

}

const deleteCartItemsByCustomerUsername = async (auth: Auth): Promise<BatchPayload> => {

    // AUTHORIZATION
    const { username, role } = auth;
    if (!['customer'].includes(role)) throw new UnauthorizedError('credentials_required', { message: 'You are not authorized to access this resource.', }); 

    // GET
    if (!username) throw new Error("Customer's username is required.");
    const customer: Customer | null = await customerDb.getCustomerByUsername(username);
    if (!customer) throw new Error("Customer does not exist.");

    const cart: Cart | null = await cartDb.getActiveCartByCustomerId(customer.getId());
    if (!cart) throw new Error("Cart does not exist.");


    // CONNECT & SAVE
    return await cartContainsProductDb.deleteCartItemsByCartId(cart.getId());
};

// TODO total cart price is not updated.
// TODO test authorization.
const deleteCartItemByCustomerUsernameAndProductName = async (auth: Auth, productName: string): Promise<CartContainsProduct> => {
    
    // AUTHORIZATION
    const { username, role } = auth;
    if (!['customer'].includes(role)) throw new UnauthorizedError('credentials_required', { message: 'You are not authorized to access this resource.', }); 

    // GET
    if (!username) throw new Error("Customer's username is required.");
    const customer: Customer | null = await customerDb.getCustomerByUsername(username);
    if (!customer) throw new Error("Customer does not exist.");

    const cart: Cart | null = await cartDb.getActiveCartByCustomerId(customer.getId());
    if (!cart) throw new Error("Cart does not exist.");

    if (!productName) throw new Error("Product name is required.");
    const product: Product | null = await productDb.getProductByName(productName);
    if (!product) throw new Error("Product does not exist.");

    const cartItem: CartContainsProduct | null = await cartContainsProductDb.getCartItemByCartIdAndProductName(cart.getId(), product.getName());
    if (!cartItem) throw new Error("Item not in cart.");

    // CONNECT & SAVE
    return cartContainsProductDb.deleteCartItemByCartIdAndProductName(cart.getId(), product.getName());
}

export default {
    getCartItemsByCustomerUsername,
    createOrUpdateCartItem,
    deleteCartItemsByCustomerUsername,
    deleteCartItemByCustomerUsernameAndProductName
}