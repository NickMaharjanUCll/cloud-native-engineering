import { Customer } from "../../model/customer";
import cartDb from "../../repository/cart.db";
import customerDb from "../../repository/customer.db";
import customerService from "../../service/customer.service";
import { CustomerInput } from "../../types";

let mock_customerDb_getCustomerByUsername: jest.Mock;
let mock_customerDb_createCustomer: jest.Mock;

let mock_cartDb_createActiveCartByCustomerId: jest.Mock;

beforeEach(() => {
    mock_customerDb_getCustomerByUsername = jest.fn();
    mock_customerDb_createCustomer = jest.fn();

    mock_cartDb_createActiveCartByCustomerId = jest.fn();
});

afterEach(() => {
    jest.clearAllMocks();
});

const customerInput: CustomerInput = {
    password: "password",
    securityQuestion: "securityQuestion",
    username: "username",
    firstName: "firstName",
    lastName: "lastName",
    phone: 123,
    role: "admin",
};

const customer: Customer = new Customer ({
    id: 1,
    password: "$2b$12$hYzyoqcEKPy0sAtFyDwMMO9uHGp9RoWB4tmxVXoxzaNPvgyXBsiOS",
    securityQuestion: "securityQuestion",
    username: "username",
    firstName: "firstName",
    lastName: "lastName",
    phone: 123,
    role: "admin",
});


test("Given non-existing customer; When calling createCustomer; Then customer is created and returned. Customer's password is hashed.", async () => {
    // GIVEN
    customerDb.getCustomerByUsername = mock_customerDb_getCustomerByUsername.mockReturnValue(null);
    customerDb.createCustomer = mock_customerDb_createCustomer.mockReturnValue(customer);
    cartDb.createActiveCartByCustomerId = mock_cartDb_createActiveCartByCustomerId.mockReturnValue("Cart created successfully.");

    // WHEN
    const result: Customer = await customerService.createCustomer(customerInput);

    // THEN
    expect(result.equal(customer)).toBeTruthy();

    expect(mock_customerDb_getCustomerByUsername).toHaveBeenCalledTimes(1);
    expect(mock_customerDb_getCustomerByUsername).toHaveBeenCalledWith(customerInput.username);

    expect(mock_customerDb_createCustomer).toHaveBeenCalledTimes(1);
    // expect(mock_customerDb_createCustomer).toHaveBeenCalledWith(customer);

    expect(mock_cartDb_createActiveCartByCustomerId).toHaveBeenCalledTimes(1);
    expect(mock_cartDb_createActiveCartByCustomerId).toHaveBeenCalledWith(customer.getId());
});


test("Given existing customer; When calling createCustomer; Then error is thrown.", () => {
    // GIVEN
    customerDb.getCustomerByUsername = mock_customerDb_getCustomerByUsername.mockReturnValue(customer);
    // customerDb.createCustomer = mock_customerDb_createCustomer.mockReturnValue(customer);
    // cartDb.createActiveCartByCustomerId = mock_cartDb_createActiveCartByCustomerId.mockReturnValue("Cart created successfully.");

    // WHEN
    const createCustomer = () => customerService.createCustomer(customerInput);

    // THEN
    expect(createCustomer).rejects.toThrow('Customer is already registered.');

    expect(mock_customerDb_getCustomerByUsername).toHaveBeenCalledTimes(1);
    expect(mock_customerDb_getCustomerByUsername).toHaveBeenCalledWith(customerInput.username);
});