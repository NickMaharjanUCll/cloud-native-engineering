export type Customer = {
  token?: string;
  id?: number;
  password?: string;
  securityQuestion?: string;
  username: string;
  firstName?: string;
  fullname?: string;
  lastName?: string;
  phone?: number;
  role?: string;
}

export type Cart = {
  id: number
  customer: Customer
  totalPrice: number
  active: boolean;
}

export type Product = {
  name: string;
  price: number;
  unit: string;
  stock: number;
  description: string;
  imagePath: string;
  deleted: boolean;
};

export type CartItem = {
  cart: Cart,
  product: Product,
  quantity: number
}

export type StatusMessage = {
  message: string;
  type: "error" | "success";
};

export type Orderr = {
  date: Date;
};

export type Order = {
  cart: Cart,
  date: Date,
  customer: Customer
}

export type HighlightedTitle = "Home" | "Profile" | "Login" | "Cart" | "Logout" | "Orders";