import { Customer } from "../model/customer";
import database from "./database";

const getCustomerByUsername = async (username: string): Promise<Customer | null> => {
    try {
        const customerPrisma = await database.customer.findUnique({
            where: {
                username: username
            }
        });
        return customerPrisma ? Customer.from(customerPrisma) : null;
        
    } catch (error) {
        console.log(error);
        throw new Error('Database error. See server logs for details.');
    }
};

const createCustomer = async ({
    password,
    securityQuestion,
    username,
    firstName,
    lastName,
    phone,
    role
}: Customer): Promise<Customer> => {
    try {
        const customerPrisma = await database.customer.create({
            data: { password, securityQuestion, username, firstName, lastName, phone, role }
        });
        return Customer.from(customerPrisma);
    } catch (error) {
        console.log(error);
        throw new Error('Database error. See server logs for details.');
    }
};

export default {
    getCustomerByUsername,
    createCustomer
};