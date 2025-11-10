import { Cart } from "../../model/cart";
import { CartContainsProduct } from "../../model/cartContainsProduct";
import { Customer } from "../../model/customer";
import { Product } from "../../model/product";
import cartDb from "../../repository/cart.db";
import cartContainsProductDb from "../../repository/cartContainsProduct.db";
import customerDb from "../../repository/customer.db";
import productDb from "../../repository/product.db";
import cartItemService from "../../service/cartItem.service";
import productService from "../../service/product.service";
import { Auth } from "../../types";


// GIVEN -----------------------------------
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

const auth: Auth = { username: customer.getUsername(), role: customer.getRole()};
const invalid_auth = { username: "", role: auth.role };


// const customerWithoutCart: Customer = new Customer({
//     id: 2,
//     password: "r0l@nd/nd1m3/s0n3",
//     securityQuestion: "What is the name of the best friend from childhood?", // TODO: We also need security answer. It may also be a list.
//     username: "Roland333",
//     firstName: "Roland",
//     lastName: "Ndime Sone",
//     phone: 444555666777
// })

const cart: Cart = new Cart({
    id: 3,
    totalPrice: 30,
    active: true,
    customer
})

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
const cartContainsProduct: CartContainsProduct = new CartContainsProduct({
    cart,
    product: products[1],
    quantity: 5
});

const customerId: number = customer.getId();
const productName: string = products[1].getName();
const cartId: number = cart.getId();
const change: string = "increase";

// SETUP -----------------------------------

let mockGetProductsByCartId: jest.Mock;
let mockGetCartItemsByCustomerUsername: jest.Mock;
let mockAddProductToCart: jest.Mock;
let mockDeleteCartItemsByCustomerUsername: jest.Mock;

let mockCartContainsProductDb_getCartItemByCartIdAndProductName: jest.Mock;
let mockCartContainsProductDb_getAllCartItemsByCartId: jest.Mock;
let mockCartContainsProductDb_createOrUpdateCartItem: jest.Mock;
let mockCartContainsProductDb_deleteCartItemsByCustomerId: jest.Mock;
let mockCartContainsProductDb_deleteCartItemByCartIdAndProductName: jest.Mock;
let mockCartContainsProductDb_updateCartItem: jest.Mock;
let mockProductDb_getProductByName: jest.Mock;
let mockCartDb_getActiveCartByCustomerId: jest.Mock;
let mockCustomerDb_getCustomerByUsername: jest.Mock;
let mockProductDb_updateProductStockByName: jest.Mock;

beforeEach(() => {
    mockGetProductsByCartId = jest.fn();
    mockGetCartItemsByCustomerUsername = jest.fn();
    mockAddProductToCart = jest.fn();
    mockDeleteCartItemsByCustomerUsername = jest.fn();

    mockCartContainsProductDb_getCartItemByCartIdAndProductName = jest.fn();
    mockCartContainsProductDb_getAllCartItemsByCartId = jest.fn();
    mockCartContainsProductDb_getAllCartItemsByCartId = jest.fn();
    mockCartContainsProductDb_createOrUpdateCartItem = jest.fn();
    mockCartContainsProductDb_deleteCartItemsByCustomerId = jest.fn();
    mockCartContainsProductDb_deleteCartItemByCartIdAndProductName = jest.fn();
    mockCartContainsProductDb_updateCartItem = jest.fn();

    mockProductDb_getProductByName = jest.fn();
    mockProductDb_updateProductStockByName = jest.fn();

    mockCartDb_getActiveCartByCustomerId = jest.fn();

    mockCustomerDb_getCustomerByUsername = jest.fn();
});

afterEach(() => {
    jest.clearAllMocks();
});


// TESTS -----------------------------------


test('Given cart ID; When calling getProductsByCartId; Then a list of products from the corresponding cart are returned.', async () => {
    // GIVEN
    // Variables at the top of the file.
    cartContainsProductDb.getAllCartItemsByCartId = mockCartContainsProductDb_getAllCartItemsByCartId.mockReturnValue([
        new CartContainsProduct({ cart, product: products[0], quantity: 5 }),
        new CartContainsProduct({ cart, product: products[1], quantity: 5 }),
    ]);

    productDb.getProductByName = mockProductDb_getProductByName.mockReturnValueOnce(new Product({
        name: "Mouse",
        price: 10,
        unit: "piece",
        stock: 16,
        description: "A computer mouse (plural mice, also mouses)[nb 1] is a hand-held pointing device that detects two-dimensional motion relative to a surface. This motion is typically translated into the motion of the pointer (called a cursor) on a display, which allows a smooth control of the graphical user interface of a computer.",
        imagePath: "mouse.png",
        deleted: false
    }))

    productDb.getProductByName = mockProductDb_getProductByName.mockReturnValueOnce(new Product({
        name: "Bananas",
        price: 5,
        unit: "bunch",
        stock: 22,
        description: "A banana is an elongated, edible fruit -- botanically a berry[1] -- produced by several kinds of large herbaceous flowering plants in the genus Musa. In some countries, cooking bananas are called plantains, distinguishing them from dessert bananas. The fruit is variable in size, color and firmness, but is usually elongated and curved, with soft flesh rich in, starch covered with a peel, which may have a variety of colors when ripe. It grows upward in clusters near the top of the plant. Almost all modern edible seedless (parthenocarp) cultivated bananas come from two wild species -- Musa acuminata and Musa balbisiana, or hybrids of them.",
        imagePath: "bananas.png",
        deleted: false
    }))


    // WHEN
    const result: Product[] = await productService.getProductsByCartId(cartId);


    // THEN
    expect(result[0].getName()).toEqual("Mouse");
    expect(result[1].getName()).toEqual("Bananas");

    expect(mockCartContainsProductDb_getAllCartItemsByCartId).toHaveBeenCalledTimes(1);
    expect(mockCartContainsProductDb_getAllCartItemsByCartId).toHaveBeenCalledWith(cartId);

    expect(mockProductDb_getProductByName).toHaveBeenCalledTimes(2);
});

test('Given no cart ID; When calling getProductsByCartId; Then an error is thrown.', () => {
    // GIVEN
    // Variables at the top of the file.

    // WHEN
    const getProductsByCartId = () => productService.getProductsByCartId(0);

    // THEN
    expect(getProductsByCartId).rejects.toThrow("Cart ID is required.");
});

// SKIPPED: Because the logic will most likely change with the real database.
test('Given product name does not exist in the product database; When calling getProductsByCartId; Then an error is thrown.', () => {
    // GIVEN
    // Variables at the top of the file.
    cartContainsProductDb.getAllCartItemsByCartId = mockCartContainsProductDb_getAllCartItemsByCartId.mockReturnValue([
        new CartContainsProduct({ cart, product: products[0], quantity: 5 }),
        new CartContainsProduct({ cart, product: products[1], quantity: 5 }),
    ]);

    productDb.getProductByName = mockProductDb_getProductByName.mockReturnValueOnce(products[1])

    // WHEN
    const getProductsByCartId = () => productService.getProductsByCartId(cartId);

    // THEN
    expect(getProductsByCartId).rejects.toThrow("Product does not exist.");

    expect(mockCartContainsProductDb_getAllCartItemsByCartId).toHaveBeenCalledTimes(1);
    expect(mockCartContainsProductDb_getAllCartItemsByCartId).toHaveBeenCalledWith(cartId);
});

test("Given customer's username; When calling getCartItemsByCustomerUsername; Then cart items of that customer are returned.", async () => {
    // GIVEN
    // Variables at the top of the file.
    cartDb.getActiveCartByCustomerId = mockCartDb_getActiveCartByCustomerId.mockReturnValue(cart);
    customerDb.getCustomerByUsername = mockCustomerDb_getCustomerByUsername.mockReturnValue(customer);

    cartContainsProductDb.getAllCartItemsByCartId = mockCartContainsProductDb_getAllCartItemsByCartId.mockReturnValue([
        new CartContainsProduct({ cart, product: products[0], quantity: 5 }),
        new CartContainsProduct({ cart, product: products[1], quantity: 5 })
    ]);


    // WHEN
    const result: CartContainsProduct[] = await cartItemService.getCartItemsByCustomerUsername(auth);


    // THEN
    expect(result[0].getProduct().getName()).toEqual("Mouse");
    expect(result[1].getProduct().getName()).toEqual("Bananas");

    expect(mockCartDb_getActiveCartByCustomerId).toHaveBeenCalledTimes(1);
    expect(mockCartDb_getActiveCartByCustomerId).toHaveBeenCalledWith(customer.getId());

    expect(mockCartContainsProductDb_getAllCartItemsByCartId).toHaveBeenCalledTimes(1);
    expect(mockCartContainsProductDb_getAllCartItemsByCartId).toHaveBeenCalledWith(cart.getId());

});

test("Given no customer's username; When calling getCartItemsByCustomerId; Then error is thrown.", () => {
    // GIVEN
    // Variables at the top of the file.

    // WHEN
    const getCartItemsByCustomerId = () => cartItemService.getCartItemsByCustomerUsername(invalid_auth);

    // THEN
    expect(getCartItemsByCustomerId).rejects.toThrow("Customer's username is required.");

});

test('Given customer without a cart; When calling getCartItemsByCustomerId; Then error is thrown.', async () => {
    // GIVEN
    // Variables at the top of the file.
    cartDb.getActiveCartByCustomerId = mockCartDb_getActiveCartByCustomerId.mockReturnValue(null);

    // WHEN
    const getCartItemsByCustomerId = () => cartItemService.getCartItemsByCustomerUsername(auth);

    // THEN
    expect(getCartItemsByCustomerId).rejects.toThrow("Cart does not exist.");
});

test("Given customer's username and product name that refer to and existing cart item; When calling createOrUpdateCartItem; Then cart item quantity is updated and message indicating success is returned.", async () => {
    // GIVEN
    // Variables at the top of the file.
    const cartItem: CartContainsProduct = cartContainsProduct;
    cartItem.setQuantity(cartItem.getQuantity() + 1);
    customerDb.getCustomerByUsername = mockCustomerDb_getCustomerByUsername.mockReturnValue(customer);
    cartDb.getActiveCartByCustomerId = mockCartDb_getActiveCartByCustomerId.mockReturnValue(cart);
    productDb.getProductByName = mockProductDb_getProductByName.mockReturnValue(products[1])
    cartContainsProductDb.getCartItemByCartIdAndProductName = mockCartContainsProductDb_getCartItemByCartIdAndProductName.mockReturnValue(cartContainsProduct);
    cartContainsProductDb.updateCartItem = mockCartContainsProductDb_updateCartItem.mockReturnValue(cartContainsProduct);


    // WHEN
    const result: CartContainsProduct | null = await cartItemService.createOrUpdateCartItem(auth, productName);


    // THEN
    expect(result).toEqual(cartContainsProduct);

    expect(mockCustomerDb_getCustomerByUsername).toHaveBeenCalledTimes(1);
    expect(mockCustomerDb_getCustomerByUsername).toHaveBeenCalledWith(customer.getUsername());

    expect(mockCartDb_getActiveCartByCustomerId).toHaveBeenCalledTimes(1);
    expect(mockCartDb_getActiveCartByCustomerId).toHaveBeenCalledWith(customer.getId());

    expect(mockProductDb_getProductByName).toHaveBeenCalledTimes(1);

    expect(mockCartContainsProductDb_getCartItemByCartIdAndProductName).toHaveBeenCalledTimes(1);
    expect(mockCartContainsProductDb_getCartItemByCartIdAndProductName).toHaveBeenCalledWith(cart.getId(), productName);

    expect(mockCartContainsProductDb_updateCartItem).toHaveBeenCalledTimes(1);
    expect(mockCartContainsProductDb_updateCartItem).toHaveBeenCalledWith(cartItem);

});

test("Given customer's username and product name that DO NOT REFER to and existing cart item; When calling createOrUpdateCartItem; Then cart item is created and message indicating success is returned.", async () => {
    // GIVEN
    // Variables at the top of the file.
    const cartItem: CartContainsProduct = cartContainsProduct;
    cartItem.setQuantity(1);

    customerDb.getCustomerByUsername = mockCustomerDb_getCustomerByUsername.mockReturnValue(customer);
    cartDb.getActiveCartByCustomerId = mockCartDb_getActiveCartByCustomerId.mockReturnValue(cart);
    productDb.getProductByName = mockProductDb_getProductByName.mockReturnValue(products[1])
    cartContainsProductDb.getCartItemByCartIdAndProductName = mockCartContainsProductDb_getCartItemByCartIdAndProductName.mockReturnValue(null);
    cartContainsProductDb.createOrUpdateCartItem = mockCartContainsProductDb_createOrUpdateCartItem.mockReturnValue(cartContainsProduct)


    // WHEN
    const result: CartContainsProduct | null = await cartItemService.createOrUpdateCartItem(auth, productName);


    // THEN
    expect(result).toEqual(cartContainsProduct);

    expect(mockCustomerDb_getCustomerByUsername).toHaveBeenCalledTimes(1);
    expect(mockCustomerDb_getCustomerByUsername).toHaveBeenCalledWith(customer.getUsername());

    expect(mockCartDb_getActiveCartByCustomerId).toHaveBeenCalledTimes(1);
    expect(mockCartDb_getActiveCartByCustomerId).toHaveBeenCalledWith(customer.getId());

    expect(mockProductDb_getProductByName).toHaveBeenCalledTimes(1);

    expect(mockCartContainsProductDb_getCartItemByCartIdAndProductName).toHaveBeenCalledTimes(1);
    expect(mockCartContainsProductDb_getCartItemByCartIdAndProductName).toHaveBeenCalledWith(cart.getId(), productName);

    expect(mockCartContainsProductDb_createOrUpdateCartItem).toHaveBeenCalledTimes(1);
    expect(mockCartContainsProductDb_createOrUpdateCartItem).toHaveBeenCalledWith(cartItem);
});

test("Given customer's username and product name that DO REFER to and existing cart item and the change parameter; When calling createOrUpdateCartItem; Then cart item and product stock is updated, and message indicating success is returned.", async () => {
    // GIVEN
    // Variables at the top of the file.
    const cartItemBefore: CartContainsProduct = cartContainsProduct;
    cartItemBefore.setQuantity(1);
    const cartItemAfter: CartContainsProduct = cartContainsProduct;
    cartItemAfter.setQuantity(2);
    const productBefore: Product = products[1];
    productBefore.setStock(3);
    const productAfter: Product = products[1];
    productAfter.setStock(2);

    customerDb.getCustomerByUsername = mockCustomerDb_getCustomerByUsername.mockReturnValue(customer);
    cartDb.getActiveCartByCustomerId = mockCartDb_getActiveCartByCustomerId.mockReturnValue(cart);
    productDb.getProductByName = mockProductDb_getProductByName.mockReturnValue(productBefore)
    cartContainsProductDb.getCartItemByCartIdAndProductName = mockCartContainsProductDb_getCartItemByCartIdAndProductName.mockReturnValue(cartItemBefore);
    productDb.updateProductStockByName = mockProductDb_updateProductStockByName.mockReturnValue("Product's stock updated successfully.");
    cartContainsProductDb.updateCartItem = mockCartContainsProductDb_updateCartItem.mockReturnValue(cartContainsProduct);

    // WHEN
    const result: CartContainsProduct | null = await cartItemService.createOrUpdateCartItem(auth, productName, change);


    // THEN
    expect(result).toEqual(cartContainsProduct);

    expect(mockCustomerDb_getCustomerByUsername).toHaveBeenCalledTimes(1);
    expect(mockCustomerDb_getCustomerByUsername).toHaveBeenCalledWith(customer.getUsername());

    expect(mockCartDb_getActiveCartByCustomerId).toHaveBeenCalledTimes(1);
    expect(mockCartDb_getActiveCartByCustomerId).toHaveBeenCalledWith(customer.getId());

    expect(mockProductDb_getProductByName).toHaveBeenCalledTimes(1);

    expect(mockCartContainsProductDb_getCartItemByCartIdAndProductName).toHaveBeenCalledTimes(1);
    expect(mockCartContainsProductDb_getCartItemByCartIdAndProductName).toHaveBeenCalledWith(cart.getId(), productName);

    expect(mockCartContainsProductDb_createOrUpdateCartItem).toHaveBeenCalledTimes(0);

    expect(mockProductDb_updateProductStockByName).toHaveBeenCalledTimes(1);
    expect(mockProductDb_updateProductStockByName).toHaveBeenCalledWith(productAfter.getName(), productAfter.getStock());

    expect(mockCartContainsProductDb_updateCartItem).toHaveBeenCalledTimes(1);
    expect(mockCartContainsProductDb_updateCartItem).toHaveBeenCalledWith(cartItemAfter);
});

test("Given customer's username and product name that DO REFER to and existing cart item and NO change parameter; When calling createOrUpdateCartItem; Then nothing is changed, and message indicating success is returned.", async () => {
    // GIVEN
    // Variables at the top of the file.
    const cartItemBefore: CartContainsProduct = cartContainsProduct;
    cartItemBefore.setQuantity(1);
    const cartItemAfter: CartContainsProduct = cartContainsProduct;
    cartItemAfter.setQuantity(2);
    const productBefore: Product = products[1];
    productBefore.setStock(3);
    const productAfter: Product = products[1];
    productAfter.setStock(2);

    customerDb.getCustomerByUsername = mockCustomerDb_getCustomerByUsername.mockReturnValue(customer);
    cartDb.getActiveCartByCustomerId = mockCartDb_getActiveCartByCustomerId.mockReturnValue(cart);
    productDb.getProductByName = mockProductDb_getProductByName.mockReturnValue(productBefore)
    cartContainsProductDb.getCartItemByCartIdAndProductName = mockCartContainsProductDb_getCartItemByCartIdAndProductName.mockReturnValue(cartItemBefore);
    productDb.updateProductStockByName = mockProductDb_updateProductStockByName.mockReturnValue("Product's stock updated successfully.");
    cartContainsProductDb.updateCartItem = mockCartContainsProductDb_updateCartItem.mockReturnValue(cartContainsProduct);

    // WHEN
    const result: CartContainsProduct | null = await cartItemService.createOrUpdateCartItem(auth, productName);


    // THEN
    expect(result).toEqual(cartContainsProduct);

    expect(mockCustomerDb_getCustomerByUsername).toHaveBeenCalledTimes(1);
    expect(mockCustomerDb_getCustomerByUsername).toHaveBeenCalledWith(customer.getUsername());

    expect(mockCartDb_getActiveCartByCustomerId).toHaveBeenCalledTimes(1);
    expect(mockCartDb_getActiveCartByCustomerId).toHaveBeenCalledWith(customer.getId());

    expect(mockProductDb_getProductByName).toHaveBeenCalledTimes(1);

    expect(mockCartContainsProductDb_getCartItemByCartIdAndProductName).toHaveBeenCalledTimes(1);
    expect(mockCartContainsProductDb_getCartItemByCartIdAndProductName).toHaveBeenCalledWith(cart.getId(), productName);

    expect(mockCartContainsProductDb_createOrUpdateCartItem).toHaveBeenCalledTimes(0);

    expect(mockProductDb_updateProductStockByName).toHaveBeenCalledTimes(1);
    expect(mockProductDb_updateProductStockByName).toHaveBeenCalledWith(productBefore.getName(), productBefore.getStock());

    expect(mockCartContainsProductDb_updateCartItem).toHaveBeenCalledTimes(1);
    expect(mockCartContainsProductDb_updateCartItem).toHaveBeenCalledWith(cartItemBefore);
});

test("Given no customer's username; When calling createOrUpdateCartItem; Then error is thrown.", () => {
    // GIVEN
    // Variables at the top of the file.

    // WHEN
    const createOrUpdateCartItem = () => cartItemService.createOrUpdateCartItem(invalid_auth, productName);

    // THEN
    expect(createOrUpdateCartItem).rejects.toThrow("Customer's username is required.");

});

test('Given customer with ID does not exist in the database; When calling createOrUpdateCartItem; Then error is thrown.', () => {
    // GIVEN
    // Variables at the top of the file.
    customerDb.getCustomerByUsername = mockCustomerDb_getCustomerByUsername.mockReturnValue(null);

    // WHEN
    const createOrUpdateCartItem = () => cartItemService.createOrUpdateCartItem(auth, productName);

    // THEN
    expect(createOrUpdateCartItem).rejects.toThrow("Customer does not exist.");
});

test('Given customer without a cart; When calling createOrUpdateCartItem; Then error is thrown.', () => {
    // GIVEN
    // Variables at the top of the file.
    customerDb.getCustomerByUsername = mockCustomerDb_getCustomerByUsername.mockReturnValue(customer);
    cartDb.getActiveCartByCustomerId = mockCartDb_getActiveCartByCustomerId.mockReturnValue(null);


    // WHEN
    const createOrUpdateCartItem = () => cartItemService.createOrUpdateCartItem(auth, productName);

    // THEN
    expect(createOrUpdateCartItem).rejects.toThrow("Cart does not exist.");

});

test('Given no product name; When calling createOrUpdateCartItem; Then error is thrown', () => {
    // GIVEN
    // Variables at the top of the file.
    const productName: string = "Bananas";
    customerDb.getCustomerByUsername = mockCustomerDb_getCustomerByUsername.mockReturnValue(customer);
    cartDb.getActiveCartByCustomerId = mockCartDb_getActiveCartByCustomerId.mockReturnValue(cart);


    // WHEN
    const createOrUpdateCartItem = () => cartItemService.createOrUpdateCartItem(auth, "");

    // THEN
    expect(createOrUpdateCartItem).rejects.toThrow("Product name is required.");

});

test('Given product does not exist in the database; When calling createOrUpdateCartItem; Then error is thrown.', () => {
    // GIVEN
    // Variables at the top of the file.
    const productName: string = "Bananas";
    customerDb.getCustomerByUsername = mockCustomerDb_getCustomerByUsername.mockReturnValue(customer);
    cartDb.getActiveCartByCustomerId = mockCartDb_getActiveCartByCustomerId.mockReturnValue(cart);
    productDb.getProductByName = mockProductDb_getProductByName.mockReturnValue(null);

    // WHEN
    const createOrUpdateCartItem = () => cartItemService.createOrUpdateCartItem(auth, productName);

    // THEN
    expect(createOrUpdateCartItem).rejects.toThrow("Product does not exist.");

});

test("Given no customer's username; When calling deleteCartItemsByCustomerUsername; Then error is thrown.", async () => {
    // GIVEN
    // Variables at the top of the file.

    // WHEN
    const deleteCartItemsByCustomerUsername = () => cartItemService.deleteCartItemsByCustomerUsername(invalid_auth);

    // THEN
    expect(deleteCartItemsByCustomerUsername).rejects.toThrow("Customer's username is required.");

});

test('Given customer does not exist in the database; When calling deleteCartItemsByCustomerUsername; Then error is thrown.', async () => {
    // GIVEN
    // Variables at the top of the file.
    customerDb.getCustomerByUsername = mockCustomerDb_getCustomerByUsername.mockReturnValue(null);

    // WHEN
    const deleteCartItemsByCustomerUsername = () => cartItemService.deleteCartItemsByCustomerUsername(auth);

    // THEN
    expect(deleteCartItemsByCustomerUsername).rejects.toThrow("Customer does not exist.");

});

test('Given a customer without a cart; When calling deleteCartItemsByCustomerUsername; Then error is thrown.', async () => {
    // GIVEN
    // Variables at the top of the file.
    customerDb.getCustomerByUsername = mockCustomerDb_getCustomerByUsername.mockReturnValue(customer);
    cartDb.getActiveCartByCustomerId = mockCartDb_getActiveCartByCustomerId.mockReturnValue(null);

    // WHEN
    const deleteCartItemsByCustomerUsername = () => cartItemService.deleteCartItemsByCustomerUsername(auth);

    // THEN
    expect(deleteCartItemsByCustomerUsername).rejects.toThrow("Cart does not exist.");

});

test("Given customer's username and product name; When calling deleteCartItemsByCustomerUsernameAndProductName; Then appropriate cart item is deleted and message indicating success is returned.", async () => {
    // GIVEN
    // Variables at the top of this file.
    customerDb.getCustomerByUsername = mockCustomerDb_getCustomerByUsername.mockReturnValue(customer);
    cartDb.getActiveCartByCustomerId = mockCartDb_getActiveCartByCustomerId.mockReturnValue(cart);
    productDb.getProductByName = mockProductDb_getProductByName.mockReturnValue(products[1])
    cartContainsProductDb.getCartItemByCartIdAndProductName = mockCartContainsProductDb_getCartItemByCartIdAndProductName.mockReturnValue(cartContainsProduct);
    cartContainsProductDb.deleteCartItemByCartIdAndProductName = mockCartContainsProductDb_deleteCartItemByCartIdAndProductName.mockReturnValue(cartContainsProduct);

    // WHEN
    const result: CartContainsProduct = await cartItemService.deleteCartItemByCustomerUsernameAndProductName(auth, products[1].getName());

    // THEN
    // expect(result).toEqual("Cart item deleted successfully.");
    expect(result).toEqual(cartContainsProduct);

    expect(mockCustomerDb_getCustomerByUsername).toHaveBeenCalledTimes(1);
    expect(mockCustomerDb_getCustomerByUsername).toHaveBeenCalledWith(customer.getUsername());

    expect(mockCartDb_getActiveCartByCustomerId).toHaveBeenCalledTimes(1);
    expect(mockCartDb_getActiveCartByCustomerId).toHaveBeenCalledWith(customer.getId());

    expect(mockProductDb_getProductByName).toHaveBeenCalledTimes(1);
    expect(mockProductDb_getProductByName).toHaveBeenCalledWith(products[1].getName());

    expect(mockCartContainsProductDb_getCartItemByCartIdAndProductName).toHaveBeenCalledTimes(1);
    expect(mockCartContainsProductDb_getCartItemByCartIdAndProductName).toHaveBeenCalledWith(cart.getId(), productName);

    expect(mockCartContainsProductDb_deleteCartItemByCartIdAndProductName).toHaveBeenCalledTimes(1);
    expect(mockCartContainsProductDb_deleteCartItemByCartIdAndProductName).toHaveBeenCalledWith(cart.getId(), productName);


});

test("Given no customer's username; When calling deleteCartItemByCustomerUsernameAndProductName; Then error is thrown.", () => {
    // GIVEN
    // Variables at the top of the file.

    // WHEN
    const deleteCartItemByCustomerUsernameAndProductName = () => cartItemService.deleteCartItemByCustomerUsernameAndProductName(invalid_auth, productName);

    // THEN
    expect(deleteCartItemByCustomerUsernameAndProductName).rejects.toThrow("Customer's username is required.");

});

test('Given customer with ID does not exist in the database; When calling deleteCartItemByCustomerUsernameAndProductName; Then error is thrown.', () => {
    // GIVEN
    // Variables at the top of the file.
    customerDb.getCustomerByUsername = mockCustomerDb_getCustomerByUsername.mockReturnValue(null);

    // WHEN
    const deleteCartItemByCustomerUsernameAndProductName = () => cartItemService.deleteCartItemByCustomerUsernameAndProductName(auth, productName);

    // THEN
    expect(deleteCartItemByCustomerUsernameAndProductName).rejects.toThrow("Customer does not exist.");
});

test('Given customer without a cart; When calling deleteCartItemByCustomerUsernameAndProductName; Then error is thrown.', () => {
    // GIVEN
    // Variables at the top of the file.
    customerDb.getCustomerByUsername = mockCustomerDb_getCustomerByUsername.mockReturnValue(customer);
    cartDb.getActiveCartByCustomerId = mockCartDb_getActiveCartByCustomerId.mockReturnValue(null);


    // WHEN
    const deleteCartItemByCustomerUsernameAndProductName = () => cartItemService.deleteCartItemByCustomerUsernameAndProductName(auth, productName);

    // THEN
    expect(deleteCartItemByCustomerUsernameAndProductName).rejects.toThrow("Cart does not exist.");

});

test('Given no product name; When calling deleteCartItemByCustomerUsernameAndProductName; Then error is thrown', () => {
    // GIVEN
    // Variables at the top of the file.
    const productName: string = "Bananas";
    customerDb.getCustomerByUsername = mockCustomerDb_getCustomerByUsername.mockReturnValue(customer);
    cartDb.getActiveCartByCustomerId = mockCartDb_getActiveCartByCustomerId.mockReturnValue(cart);


    // WHEN
    const deleteCartItemByCustomerUsernameAndProductName = () => cartItemService.deleteCartItemByCustomerUsernameAndProductName(auth, "");

    // THEN
    expect(deleteCartItemByCustomerUsernameAndProductName).rejects.toThrow("Product name is required.");

});

test('Given product does not exist in the database; When calling deleteCartItemByCustomerUsernameAndProductName; Then error is thrown.', () => {
    // GIVEN
    // Variables at the top of the file.
    const productName: string = "Bananas";
    customerDb.getCustomerByUsername = mockCustomerDb_getCustomerByUsername.mockReturnValue(customer);
    cartDb.getActiveCartByCustomerId = mockCartDb_getActiveCartByCustomerId.mockReturnValue(cart);
    productDb.getProductByName = mockProductDb_getProductByName.mockReturnValue(null);

    // WHEN
    const deleteCartItemByCustomerUsernameAndProductName = () => cartItemService.deleteCartItemByCustomerUsernameAndProductName(auth, productName);

    // THEN
    expect(deleteCartItemByCustomerUsernameAndProductName).rejects.toThrow("Product does not exist.");

});

test('Given cart item does not exist in the database; When calling deleteCartItemByCustomerUsernameAndProductName; Then error is thrown.', () => {
    // GIVEN
    // Variables at the top of the file.
    const productName: string = "Bananas";
    customerDb.getCustomerByUsername = mockCustomerDb_getCustomerByUsername.mockReturnValue(customer);
    cartDb.getActiveCartByCustomerId = mockCartDb_getActiveCartByCustomerId.mockReturnValue(cart);
    productDb.getProductByName = mockProductDb_getProductByName.mockReturnValue(products[1]);
    cartContainsProductDb.getCartItemByCartIdAndProductName = mockCartContainsProductDb_getCartItemByCartIdAndProductName.mockReturnValue(null);

    // WHEN
    const deleteCartItemByCustomerUsernameAndProductName = () => cartItemService.deleteCartItemByCustomerUsernameAndProductName(auth, productName);

    // THEN
    expect(deleteCartItemByCustomerUsernameAndProductName).rejects.toThrow("Item not in cart.");

});