import { UnauthorizedError } from "express-jwt";
import { Cart } from "../model/cart";
import { CartContainsProduct } from "../model/cartContainsProduct";
import cartDb from "../repository/cart.db";
import { Auth } from "../types";
import cartItemService from "./cartItem.service";

const createNewActiveCartAndDeactivateTheCurrentOne = async (currentCart: Cart) => {
    // GET
    // The method is called from another service, so validation is not needed.
    const auth: Auth = { username: currentCart.getCustomer().getUsername(), role: currentCart.getCustomer().getRole()};
    const totalPrice: number = await getTotalCartPriceByCustomerUsername(auth);

    // CONNECT
    currentCart.setActive(false);
    currentCart.setTotalPrice(totalPrice);

    // SAVE
    cartDb.updateCart(currentCart);
    cartDb.createActiveCartByCustomerId(currentCart.getCustomer().getId());
};

const getTotalCartPriceByCustomerUsername = async (auth: Auth) => {

    // AUTHORIZATION
    const { username, role } = auth;
    if (!['customer'].includes(role)) throw new UnauthorizedError('credentials_required', { message: 'You are not authorized to access this resource.', }); 
    
    let totalPrice: number = 0;

    const cartItems: CartContainsProduct[] = await cartItemService.getCartItemsByCustomerUsername(auth);
    for (let cartItem of cartItems) {
        totalPrice += cartItem.getProduct().getPrice() * cartItem.getQuantity();
    };

    // const calculateArea = ({ x }: { x: number  }): string => `Area is ${x * x}`;
    // calculateArea({ x: 3, y: 4 })

    return totalPrice;
};

export default {
    createNewActiveCartAndDeactivateTheCurrentOne,
    getTotalCartPriceByCustomerUsername
};