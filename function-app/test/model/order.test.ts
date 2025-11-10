import { Cart } from "../../model/cart";
import { Customer } from "../../model/customer";
import { Order } from "../../model/order"
import { set } from 'date-fns';

const date = set(new Date(), { hours: 15, minutes: 30, seconds: 20, milliseconds: 200 })
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
const cart: Cart = new Cart({ id, totalPrice, active, customer });

test("Given valid values; When creating order; Then order is created with those values.", () => {
     // GIVEN
     // Values at the top of this file.

     // WHEN
     const order = new Order({ date, cart, customer })

     // THEN
     expect(order.getDate()).toEqual(date) // use toEqual for date validation
     expect(order.getCart()).toBe(cart)
})