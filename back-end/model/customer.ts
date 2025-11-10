import {
    Customer as CustomerPrisma,
    Order as OrderPrisma,
    Cart as CartPrisma
} from '@prisma/client';
import { Role } from '../types';
export class Customer {
    id?: number;
    readonly password: string;
    readonly securityQuestion: string;
    readonly username: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly phone: number;
    readonly role: Role;

    constructor(customer: {
        id?: number;
        password: string;
        securityQuestion: string;
        username: string;
        firstName: string;
        lastName: string;
        phone: number;
        role: Role;
    }) {
        this.validate(customer);

        this.id = customer.id;
        this.password = customer.password;
        this.securityQuestion = customer.securityQuestion;
        this.username = customer.username;
        this.firstName = customer.firstName;
        this.lastName = customer.lastName;
        this.phone = customer.phone;
        this.role = customer.role;
    }

    validate(customer: { password: string, securityQuestion: string, username: string, firstName: string, lastName: string, phone: number, role: Role }) {
        if (!customer.password?.trim()) throw new Error("Password is required.");
        if (!customer.securityQuestion?.trim()) throw new Error("Security question is required.");
        if (!customer.username?.trim()) throw new Error("Username is required.");
        if (!customer.firstName?.trim()) throw new Error("First name is required.");
        if (!customer.lastName?.trim()) throw new Error("Last name is required.");
        if (!customer.phone) throw new Error("Phone is required.");
        if (!customer.role?.trim()) throw new Error("Role is required.");
    }

    // Q&A Are equal methods required in the models? A: Yes.
    
    static from({
        id,
        password,
        securityQuestion,
        username,
        firstName,
        lastName,
        phone,
        role
    }: CustomerPrisma) {
    // }: CustomerPrisma & { order: OrderPrisma; cart: CartPrisma[] }) {
        return new Customer({
            id,
            password,
            securityQuestion,
            username,
            firstName,
            lastName,
            phone,
            role: role as Role
            // order: Order.from(order),
            // cart: Cart.from(cart)
        });
    };

    equal(newCustomer: Customer) {
        return (
            newCustomer.id === this.id &&
            // newCustomer.password === this.password &&
            newCustomer.securityQuestion === this.securityQuestion &&
            newCustomer.username === this.username &&
            newCustomer.firstName === this.firstName &&
            newCustomer.lastName === this.lastName &&
            newCustomer.phone === this.phone &&
            newCustomer.role === this.role
        );
    }

    getId(): number {
        return this.id || 1;
    }

    getPassword(): string {
        return this.password;
    }

    getSecurityQuestion(): string {
        return this.securityQuestion;
    }

    getUsername(): string {
        return this.username;
    }

    getFirstName(): string {
        return this.firstName;
    }

    getLastName(): string {
        return this.lastName;
    }

    getPhone(): number {
        return this.phone;
    }

    getRole(): Role {
        return this.role;
    }
}