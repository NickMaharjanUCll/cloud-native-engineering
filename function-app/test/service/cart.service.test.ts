import { Cart } from "../../model/cart";
import { CartContainsProduct } from "../../model/cartContainsProduct";
import { Customer } from "../../model/customer";
import { Product } from "../../model/product";
import cartDb from "../../repository/cart.db";
import cartService from "../../service/cart.service";
import cartItemService from "../../service/cartItem.service";
import { Auth } from "../../types";

const customer: Customer = new Customer({
    id: 1,
    password: "m@t3j-v3s3l",
    securityQuestion: "What is the name of the best friend from childhood?", // TODO: We also need security answer. It may also be a list.
    username: "Matej333",
    firstName: "Matej",
    lastName: "Vesel",
    phone: 333444555666,
    role: "customer"
})
const auth: Auth = { username: customer.getUsername(), role: customer.getRole() };

const cart: Cart = new Cart({
    id: 3,
    totalPrice: 30,
    active: true,
    customer
})

const bananas: Product = new Product({
    name: "Bananas",
    price: 5,
    unit: "bunch",
    stock: 22,
    description: "A banana is an elongated, edible fruit -- botanically a berry[1] -- produced by several kinds of large herbaceous flowering plants in the genus Musa. In some countries, cooking bananas are called plantains, distinguishing them from dessert bananas. The fruit is variable in size, color and firmness, but is usually elongated and curved, with soft flesh rich in, starch covered with a peel, which may have a variety of colors when ripe. It grows upward in clusters near the top of the plant. Almost all modern edible seedless (parthenocarp) cultivated bananas come from two wild species -- Musa acuminata and Musa balbisiana, or hybrids of them.",
    imagePath: "bananas.png",
    deleted: false
});

const mouse: Product = new Product({
    name: "Mouse",
    price: 10,
    unit: "piece",
    stock: 16,
    description: "A computer mouse (plural mice, also mouses)[nb 1] is a hand-held pointing device that detects two-dimensional motion relative to a surface. This motion is typically translated into the motion of the pointer (called a cursor) on a display, which allows a smooth control of the graphical user interface of a computer.",
    imagePath: "mouse.png",
    deleted: false
});

const cartItems: CartContainsProduct[] = [
    new CartContainsProduct({ cart, product: bananas, quantity: 5 }),
    new CartContainsProduct({ cart, product: mouse, quantity: 6 })
];

const totalPrice: number = bananas.getPrice() * 5 + mouse.getPrice() * 6;

let currentCart: Cart;
let updatedCart: Cart;
let newCart: Cart;

// let mock_cartService_getTotalCartPriceByCustomerUsername: jest.Mock;
let mock_cartDb_updateCart: jest.Mock;
let mock_cartDb_createActiveCartByCustomerId: jest.Mock;
let mock_cartItemService_getCartItemsByCustomerUsername: jest.Mock;

beforeEach(() => {
    // mock_cartService_getTotalCartPriceByCustomerUsername = jest.fn();
    mock_cartDb_updateCart = jest.fn();
    mock_cartDb_createActiveCartByCustomerId = jest.fn();
    mock_cartItemService_getCartItemsByCustomerUsername = jest.fn();

    currentCart = new Cart({
        id: 3,
        totalPrice: 30,
        active: true,
        customer
    });
    updatedCart = new Cart({
        id: 3,
        totalPrice: totalPrice,
        active: false,
        customer
    });
    newCart = new Cart({
        id: 3,
        totalPrice: 0,
        active: true,
        customer
    })
});

afterEach(() => {
    jest.clearAllMocks();
});


test("Given customer's username; When calling getTotalCartPriceByCustomerUsername; Then total price of customer's active cart is returned.", async () => {
    // GIVEN
    cartItemService.getCartItemsByCustomerUsername = mock_cartItemService_getCartItemsByCustomerUsername.mockReturnValue(cartItems);

    // WHEN
    const result = await cartService.getTotalCartPriceByCustomerUsername(auth);

    // THEN
    expect(result).toEqual(totalPrice);

    expect(mock_cartItemService_getCartItemsByCustomerUsername).toHaveBeenCalledTimes(1);
    expect(mock_cartItemService_getCartItemsByCustomerUsername).toHaveBeenCalledWith(auth);
});

test("Given active cart; When calling createNewActiveCartAndDeactivateTheCurrentOne; Then active cart is deactivated and customer receives a new empty cart.", async () => {
    // GIVEN
    // Variables at the top of this file.
    // cartService.getTotalCartPriceByCustomerUsername = mock_cartService_getTotalCartPriceByCustomerUsername.mockReturnValue(50);
    cartItemService.getCartItemsByCustomerUsername = mock_cartItemService_getCartItemsByCustomerUsername.mockReturnValue(cartItems);
    cartDb.updateCart = mock_cartDb_updateCart.mockReturnValue(null);
    cartDb.createActiveCartByCustomerId = mock_cartDb_createActiveCartByCustomerId.mockReturnValue(null);

    // WHEN
    const result = await cartService.createNewActiveCartAndDeactivateTheCurrentOne(currentCart);

    // THEN:
    expect(result).toEqual(undefined);

    expect(mock_cartItemService_getCartItemsByCustomerUsername).toHaveBeenCalledTimes(1);
    expect(mock_cartItemService_getCartItemsByCustomerUsername).toHaveBeenCalledWith(auth);

    expect(mock_cartDb_updateCart).toHaveBeenCalledTimes(1);
    expect(mock_cartDb_updateCart).toHaveBeenCalledWith(updatedCart);

    expect(mock_cartDb_createActiveCartByCustomerId).toHaveBeenCalledTimes(1);
    expect(mock_cartDb_createActiveCartByCustomerId).toHaveBeenCalledWith(updatedCart.getCustomer().getId());

});