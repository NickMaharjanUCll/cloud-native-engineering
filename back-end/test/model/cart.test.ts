import { Cart } from '../../model/cart';
import { Customer } from '../../model/customer';

const id: number = 8872523;
const totalPrice: number = 50;
const active: boolean = true;
// const customerId: number = 522567;
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

// Q&A Do we have to write given when then with colons and semi-colons? A: Doesn't matter as long as it's clear.
test('Given valid values; When creating a cart; Then cart is created with those values.', () => {
    // GIVEN 
    // Values at the top of this file.

    // WHEN
    const cart: Cart = new Cart({ id, totalPrice, active, customer });

    // THEN
    expect(cart.getId()).toEqual(id);
    expect(cart.getTotalPrice()).toEqual(totalPrice);
    expect(cart.getCustomer()).toEqual(customer);
});

test('Given cart with negative total price; When creating a cart; Then error is thrown.', () => {
    // GIVEN
    // Values at the top of this file.

    // WHEN
    const createCart = () => new Cart({ id, totalPrice: -50, active, customer });

    // THEN
    expect(createCart).toThrow("Total price must be non-negative.");
});