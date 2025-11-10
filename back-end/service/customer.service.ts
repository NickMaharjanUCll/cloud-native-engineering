import bcrypt from 'bcrypt';
// import * as bcrypt from 'bcrypt';
import { Customer } from "../model/customer";
import customerDb from "../repository/customer.db";
import { AuthenticationResponse, CustomerInput } from "../types";
import { generateJwtToken } from "../util/jwt";
import { UnauthorizedError } from 'express-jwt';
import { create } from 'domain';
import cartDb from '../repository/cart.db';

const getCustomerByUsername = async (username: string): Promise<Customer> => {
    const customer = await customerDb.getCustomerByUsername(username);
    if (!customer) throw new UnauthorizedError('invalid_token', {message: 'Customer does not exist.'});
    return customer;
};

const authenticate = async ({ username, password }: CustomerInput): Promise<AuthenticationResponse> => {
    const customer = await getCustomerByUsername(username);

    const isValidPassword = await bcrypt.compare(password, customer.password);
    if (!isValidPassword) throw new UnauthorizedError('invalid_token', {message: 'Incorrect password.'});

    return {
        token: generateJwtToken({ username, role: customer.role }),
        username,
        fullname: `${customer.firstName} ${customer.lastName}`,
        role: customer.role
    };
};

// TODO test.
const createCustomer = async ({
    password,
    securityQuestion,
    username,
    firstName,
    lastName,
    phone,
    role
}: CustomerInput):  Promise<Customer> => {
    // GET
    const existingCustomer = await customerDb.getCustomerByUsername(username); // TODO he uses types. { username }
    if (existingCustomer) throw new Error("Customer is already registered.");

    // CONNECT
    const hashedPassword = await bcrypt.hash(password, 12);
    const customer = new Customer({ 
        password: hashedPassword,
        securityQuestion,
        username,
        firstName,
        lastName,
        phone,
        role
     });


    // SAVE
    const createdCustomer: Customer = await customerDb.createCustomer(customer);
    await cartDb.createActiveCartByCustomerId(createdCustomer.getId());

    return createdCustomer;

};

export default {
    createCustomer,
    authenticate
};