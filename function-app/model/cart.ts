import {
    Cart as CartPrisma,
    Customer as CustomerPrisma
} from '@prisma/client';
import { Customer } from './customer';
export class Cart {
    // TODO: Should be private fields.
    id: number;
    totalPrice: number;
    active: boolean;
    customer: Customer;

    // Q&A Is it not better to use setters immediately in the constructor? A: yes.
    //I also thought of the same thing. I thing we could
    //do we need any extra logic for setId methods in the classes?

    constructor(cart: { id: number, totalPrice: number, active: boolean, customer: Customer }) {
        this.validate(cart);

        this.id = cart.id;
        this.totalPrice = cart.totalPrice;
        this.active = cart.active;
        this.customer = cart.customer;
    }

    validate(cart: { totalPrice: number, active: boolean, customer: Customer }) {
        if (cart.totalPrice < 0) throw new Error("Total price must be non-negative.");
        if (!cart.customer) throw new Error("Customer is required.");
        if (cart.active === null) throw new Error("Active field cannot be null.");
    }

    static from({ 
        id,
        totalPrice,
        active,
        customer
     }: CartPrisma & { customer: CustomerPrisma }) {
        return new Cart({ 
            id,
            totalPrice,
            active,
            customer: Customer.from(customer)
         });
     };

    getId(): number {
        return this.id;
    }

    getActive(): boolean {
        return this.active;
    }

    setActive(active: boolean): void {
        this.active = active;
    };

    getTotalPrice(): number {
        return this.totalPrice
    }

    setTotalPrice(totalPrice: number): void {
        this.totalPrice = totalPrice;
    };

    getCustomer(): Customer {
        return this.customer;
    }

}