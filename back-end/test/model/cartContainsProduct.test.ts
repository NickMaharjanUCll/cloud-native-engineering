import { Cart } from "../../model/cart";
import { CartContainsProduct } from "../../model/cartContainsProduct";
import { Customer } from "../../model/customer";
import { Product } from "../../model/product";

const customer = new Customer({
    id: 1,
    password: "m@t3j-v3s3l",
    securityQuestion: "What is the name of the best friend from childhood?", // TODO: We also need security answer. It may also be a list.
    username: "Matej333",
    firstName: "Matej",
    lastName: "Vesel",
    phone: 333444555666,
    role: "customer"
});

const cart = new Cart({
    id: 3,
    totalPrice: 0,
    active: true,
    customer
});

const resourceImagePath: String = "/images/"; // refers to "front-end/public/images".
const product = new Product({
    name: "Bananas",
    price: 5,
    unit: "bunch",
    stock: 22,
    description: "A banana is an elongated, edible fruit -- botanically a berry[1] -- produced by several kinds of large herbaceous flowering plants in the genus Musa. In some countries, cooking bananas are called plantains, distinguishing them from dessert bananas. The fruit is variable in size, color and firmness, but is usually elongated and curved, with soft flesh rich in, starch covered with a peel, which may have a variety of colors when ripe. It grows upward in clusters near the top of the plant. Almost all modern edible seedless (parthenocarp) cultivated bananas come from two wild species -- Musa acuminata and Musa balbisiana, or hybrids of them.",
    imagePath: resourceImagePath + "bananas.png",
    deleted: false
})
const quantity: number = 1;

test('Given valid values; When creating CartContainsProduct object; Then object is created with those values.', () => {
    // GIVEN 
    // Values at the top of this file.

    // WHEN
    const cartContainsProduct: CartContainsProduct = new CartContainsProduct({ cart, product, quantity });

    // THEN
    expect(cartContainsProduct.getCart().getId()).toBe(cart.getId());
    expect(cartContainsProduct.getProduct().getName()).toBe(product.getName());
    expect(cartContainsProduct.getQuantity()).toBe(quantity);
});

test('Given non-positive quantity; When creating CartContainsProduct object; Then error is thrown.', () => {
    // GIVEN 
    // Values at the top of this file.

    // WHEN
    const createCartContainsProduct = () => new CartContainsProduct({ cart, product, quantity: 0 });

    // THEN
    expect(createCartContainsProduct).toThrow("Quantity must be positive.");
});

test('Given non-positive quantity; When calling setQuantity; Then error is thrown.', () => {
    // GIVEN 
    // Values at the top of this file.
    const cartContainsProduct: CartContainsProduct = new CartContainsProduct({ cart, product, quantity });

    // WHEN
    const setQuantity = () => cartContainsProduct.setQuantity(0);

    // THEN
    expect(setQuantity).toThrow("Quantity must be positive.");
});

