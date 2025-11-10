type CartInput = {
    id?: number;
    totalPrice?: number;
    active?: boolean;
    customer?: CustomerInput;
};

type CustomerInput = {
    id?: number;
    password: string;
    securityQuestion: string;
    username: string;
    firstName: string;
    lastName: string;
    phone: number;
    role: Role;
};

type OrderInput= {
    auth: Auth;
    cart?: CartInput;
    date?: Date;
};

type AuthenticationResponse = {
    token: string;
    username: string;
    fullname: string;
    role: Role;
};

type Role = 'admin' | 'customer' | 'guest';

type Auth = {
    username: string;
    role: Role;
};

type BatchPayload = {
    count: number;
};

type ChangeQuantity = 'increase' | 'decrease';

export {
    OrderInput,
    CustomerInput,
    CartInput,
    AuthenticationResponse,
    Role,
    Auth,
    BatchPayload,
    ChangeQuantity
}