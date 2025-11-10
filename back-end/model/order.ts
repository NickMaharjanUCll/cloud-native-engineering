import {
    Customer as CustomerPrisma,
    Order as OrderPrisma,
    Cart as CartPrisma
} from '@prisma/client';
import { Cart } from './cart';
import { Customer } from './customer';

export class Order {
    readonly cart: Cart;
    readonly date: Date;
    readonly customer: Customer;

    constructor(order: { cart: Cart, date: Date, customer: Customer }) {
        this.validate(order);

        this.cart = order.cart;
        this.date = order.date;
        this.customer = order.customer;
    }

    validate(order: { date: Date }) {
        if (!order.date) throw new Error("Date is required.");
        // TODO date cannot be in the future.
    }

    getCart(): Cart {
        return this.cart
    }

    getDate(): Date {
        return this.date
    }

    getCustomer(): Customer {
        return this.customer;
    };

    static from({
        cart,
        date,
        customer
    }: OrderPrisma & { cart: CartPrisma & { customer: CustomerPrisma }; customer: CustomerPrisma }) {
        return new Order({
            cart: Cart.from(cart),
            date,
            customer: Customer.from(customer)
        });
    };
}