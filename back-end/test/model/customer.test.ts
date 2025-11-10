import { Customer } from '../../model/customer';
import { Role } from '../../types';

const id: undefined | number = 522567;
const password: string = "five-tw0-tw0-five-six-seven";
const securityQuestion: string = "What is your favorite color?";//really??
const username: string = "leopold522";
const firstName: string = "Leopold";
const lastName: string = "Stravinsky";
const phone: number = 562259129;
const role: Role = "customer";

test('Given valid values for customer; When creating customer; Then customer is created with those values.', () => {
    // GIVEN
    // Values at the top of this file.

    // WHEN
    const customer: Customer = new Customer({ id, password, securityQuestion, username, firstName, lastName, phone, role });

    // THEN
    expect(customer.getId()).toEqual(id);
    expect(customer.getPassword()).toEqual(password);
    expect(customer.getSecurityQuestion()).toEqual(securityQuestion);
    expect(customer.getUsername()).toEqual(username);
    expect(customer.getFirstName()).toEqual(firstName);
    expect(customer.getLastName()).toEqual(lastName);
    expect(customer.getPhone()).toEqual(phone);
});

test('Given no password; When creating customer; Then error is thrown.', () => {
    // GIVEN
    // Values at the top of this file.

    // WHEN
    const createCustomer = () => new Customer({ id, password: "", securityQuestion, username, firstName, lastName, phone, role });

    // THEN
    expect(createCustomer).toThrow("Password is required.");
});

test('Given no security question; When creating customer; Then error is thrown.', () => {
    // GIVEN
    // Values at the top of this file.

    // WHEN
    const createCustomer = () => new Customer({ id, password, securityQuestion: "", username, firstName, lastName, phone, role });

    // THEN
    expect(createCustomer).toThrow("Security question is required.");
});

test('Given no username; When creating customer; Then error is thrown.', () => {
    // GIVEN
    // Values at the top of this file.

    // WHEN
    const createCustomer = () => new Customer({ id, password, securityQuestion, username: "", firstName, lastName, phone, role });

    // THEN
    expect(createCustomer).toThrow("Username is required.");
});

test('Given no first name; When creating customer; Then error is thrown.', () => {
    // GIVEN
    // Values at the top of this file.

    // WHEN
    const createCustomer = () => new Customer({ id, password, securityQuestion, username, firstName: "", lastName, phone, role });

    // THEN
    expect(createCustomer).toThrow("First name is required.");
});

test('Given no last name; When creating customer; Then error is thrown.', () => {
    // GIVEN
    // Values at the top of this file.

    // WHEN
    const createCustomer = () => new Customer({ id, password, securityQuestion, username, firstName, lastName: "", phone, role });

    // THEN
    expect(createCustomer).toThrow("Last name is required.");
});