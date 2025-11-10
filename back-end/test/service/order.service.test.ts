import { Cart } from "../../model/cart";
import { CartContainsProduct } from "../../model/cartContainsProduct";
import { Customer } from "../../model/customer";
import { Order } from "../../model/order";
import { Product } from "../../model/product";
import cartDb from "../../repository/cart.db";
import customerDb from "../../repository/customer.db";
import orderDb from "../../repository/order.db";
import cartService from "../../service/cart.service";
import orderService from "../../service/order.service";
import { Auth, CartInput, CustomerInput } from "../../types";


// GIVEN -----------------------------------
const customerInput: CustomerInput = {
    id: 1,
    password: "m@t3j-v3s3l",
    securityQuestion: "What is the name of the best friend from childhood?", // TODO: We also need security answer. It may also be a list.
    username: "Matej333",
    firstName: "Matej",
    lastName: "Vesel",
    phone: 333444555666,
    role: "customer"
};

const customer: Customer = new Customer({
    id: 1,
    password: "m@t3j-v3s3l",
    securityQuestion: "What is the name of the best friend from childhood?", // TODO: We also need security answer. It may also be a list.
    username: "Matej333",
    firstName: "Matej",
    lastName: "Vesel",
    phone: 333444555666,
    role: "customer"
});
const auth: Auth = { username: customer.getUsername(), role: customer.getRole() };

// const customerWithoutCart: Customer = new Customer({
//     id: 2,
//     password: "r0l@nd/nd1m3/s0n3",
//     securityQuestion: "What is the name of the best friend from childhood?", // TODO: We also need security answer. It may also be a list.
//     username: "Roland333",
//     firstName: "Roland",
//     lastName: "Ndime Sone",
//     phone: 444555666777
// })

const cartInput: CartInput = {
    id: 3,
    totalPrice: 30,
    active: true,
    customer: customerInput
};
const cart: Cart = new Cart ({
    id: 3,
    totalPrice: 30,
    active: true,
    customer
});

const resourceImagePath: String = "/images/"; // refers to "front-end/public/images".
const products: Product[] = [
    new Product({
        name: "Mouse",
        price: 10,
        unit: "piece",
        stock: 16,
        description: "A computer mouse (plural mice, also mouses)[nb 1] is a hand-held pointing device that detects two-dimensional motion relative to a surface. This motion is typically translated into the motion of the pointer (called a cursor) on a display, which allows a smooth control of the graphical user interface of a computer.",
        imagePath: resourceImagePath + "mouse.png",
        deleted: false
    }),
    new Product({
        name: "Bananas",
        price: 5,
        unit: "bunch",
        stock: 22,
        description: "A banana is an elongated, edible fruit -- botanically a berry[1] -- produced by several kinds of large herbaceous flowering plants in the genus Musa. In some countries, cooking bananas are called plantains, distinguishing them from dessert bananas. The fruit is variable in size, color and firmness, but is usually elongated and curved, with soft flesh rich in, starch covered with a peel, which may have a variety of colors when ripe. It grows upward in clusters near the top of the plant. Almost all modern edible seedless (parthenocarp) cultivated bananas come from two wild species -- Musa acuminata and Musa balbisiana, or hybrids of them.",
        imagePath: resourceImagePath + "bananas.png",
        deleted: false
    })
];
// const cartContainsProduct: CartContainsProduct = new CartContainsProduct({
//     cart: cartInput,
//     product: products[1],
//     quantity: 5
// });

const date = new Date("2024");
const orderInput = { auth, cart: cartInput, date };
const orderInput2 = { cart: cartInput, date, customer };

// SETUP -----------------------------------

// let mock_orderService_createOrder: jest.Mock;

let mock_customerDb_getCustomerByUsername: jest.Mock;
let mock_cartDb_getActiveCartByCustomerId: jest.Mock;
let mock_cartService_getTotalCartPriceByCustomerUsername: jest.Mock;
let mock_cartService_createNewActiveCartAndDeactivateTheCurrentOne: jest.Mock;
let mock_orderDb_createOrder: jest.Mock;

beforeEach(() => {
    // mock_orderService_createOrder = jest.fn();

    mock_customerDb_getCustomerByUsername = jest.fn();
    mock_cartDb_getActiveCartByCustomerId = jest.fn();
    mock_cartService_getTotalCartPriceByCustomerUsername = jest.fn();
    mock_cartService_createNewActiveCartAndDeactivateTheCurrentOne = jest.fn();
    mock_orderDb_createOrder = jest.fn();
});

afterEach(() => {
    jest.clearAllMocks();
});

test("Given date and customer username in OrderInput; When calling createOrder; Then order is created, customer gets a new active cart and message indicating success is returned.", async () => {
    // GIVEN
    // Variables at the top of this file.
    customerDb.getCustomerByUsername = mock_customerDb_getCustomerByUsername.mockReturnValue(customer);
    cartDb.getActiveCartByCustomerId = mock_cartDb_getActiveCartByCustomerId.mockReturnValue(cart);
    cartService.getTotalCartPriceByCustomerUsername = mock_cartService_getTotalCartPriceByCustomerUsername.mockReturnValue(25);
    cartService.createNewActiveCartAndDeactivateTheCurrentOne = mock_cartService_createNewActiveCartAndDeactivateTheCurrentOne.mockReturnValue(null);
    orderDb.createOrder = mock_orderDb_createOrder.mockReturnValue("Order placed successfully.");

    // WHEN
    const result = await orderService.createOrder(orderInput);

    // THEN
    expect(result).toEqual("Order placed successfully.");

    expect(mock_customerDb_getCustomerByUsername).toHaveBeenCalledTimes(1);
    expect(mock_customerDb_getCustomerByUsername).toHaveBeenCalledWith(customerInput.username);

    expect(mock_cartDb_getActiveCartByCustomerId).toHaveBeenCalledTimes(1);
    expect(mock_cartDb_getActiveCartByCustomerId).toHaveBeenCalledWith(customer.getId());

    expect(mock_cartService_getTotalCartPriceByCustomerUsername).toHaveBeenCalledTimes(1);
    expect(mock_cartService_getTotalCartPriceByCustomerUsername).toHaveBeenCalledWith(auth)

    expect(mock_cartService_createNewActiveCartAndDeactivateTheCurrentOne).toHaveBeenCalledTimes(1);
    expect(mock_cartService_createNewActiveCartAndDeactivateTheCurrentOne).toHaveBeenCalledWith(cart);

    expect(mock_orderDb_createOrder).toHaveBeenCalledTimes(1);
    expect(mock_orderDb_createOrder).toHaveBeenCalledWith(orderInput2);

});

// Q&A How to test this? A: dont test it.
// test("Given no date in OrderInput; When calling createOrder; Then error is thrown.", () => {
//     // GIVEN
//     // Variables at the top of this file.


//     // WHEN
//     const createOrder = () => orderService.createOrder({ date: null,  });

//     // THEN
// });

// test("Given no customer in OrderInput; When calling createOrder; Then error is thrown.", () => {
//     // GIVEN
//     // Variables at the top of this file.


//     // WHEN

//     // THEN
// });

// test("Given no customer username in CustomerInput; When calling createOrder; Then error is thrown.", () => {
//     // GIVEN
//     // Variables at the top of this file.

//     // WHEN
//     const createOrder = () => orderService.createOrder({ date, customer: {} });

//     // THEN
//     expect(createOrder).rejects.toThrow("Customer's username is required.");
// });

test("Given no customer in database; When calling createOrder; Then error is thrown.", () => {
    // GIVEN
    // Variables at the top of this file.
    customerDb.getCustomerByUsername = mock_customerDb_getCustomerByUsername.mockReturnValue(null);

    // WHEN
    const createOrder = () => orderService.createOrder(orderInput);

    // THEN
    expect(createOrder).rejects.toThrow("Customer does not exist.");
});

test("Given no cart in database; When calling createOrder; Then error is thrown.", () => {
    // GIVEN
    // Variables at the top of this file.
    customerDb.getCustomerByUsername = mock_customerDb_getCustomerByUsername.mockReturnValue(customer);
    cartDb.getActiveCartByCustomerId = mock_cartDb_getActiveCartByCustomerId.mockReturnValue(null);

    // WHEN
    const createOrder = () => orderService.createOrder(orderInput);

    // THEN
    expect(createOrder).rejects.toThrow("Cart does not exist.");
});

test("Given order has already been made with this cart (cart is not active); When calling createOrder; Then error is thrown.", () => {
    // GIVEN
    // Variables at the top of this file.
    customerDb.getCustomerByUsername = mock_customerDb_getCustomerByUsername.mockReturnValue(customer);
    const inactiveCart: Cart = new Cart ({ id: 3, totalPrice: 30, active: false, customer });
    cartDb.getActiveCartByCustomerId = mock_cartDb_getActiveCartByCustomerId.mockReturnValue(inactiveCart);

    // WHEN
    const createOrder = () => orderService.createOrder(orderInput);

    // THEN
    expect(createOrder).rejects.toThrow("Order with this cart has already been made.");
});

test("Given cart is empty; When calling createOrder; Then error is thrown.", () => {
    // GIVEN
    // Variables at the top of this file.
    customerDb.getCustomerByUsername = mock_customerDb_getCustomerByUsername.mockReturnValue(customer);
    cartDb.getActiveCartByCustomerId = mock_cartDb_getActiveCartByCustomerId.mockReturnValue(cart);
    cartService.getTotalCartPriceByCustomerUsername = mock_cartService_getTotalCartPriceByCustomerUsername.mockReturnValue(0);

    // WHEN
    const createOrder = () => orderService.createOrder(orderInput);

    // THEN
    expect(createOrder).rejects.toThrow("Cart is empty.");
});

