import {
    Product as ProductPrisma,
    CartContainsProduct as CartContainsProductPrisma,
} from '@prisma/client';

export class Product {
    readonly name: string;
    readonly price: number;
    readonly unit: string;
    stock: number;
    readonly description: string;
    readonly imagePath: string;
    readonly deleted: boolean;

    constructor(product: { name: string, price: number, unit: string, stock: number, description: string, imagePath: string, deleted: boolean }) {
        this.validate(product);

        this.name = product.name;
        this.price = product.price;
        this.unit = product.unit;
        this.stock = product.stock;
        this.description = product.description;
        this.imagePath = product.imagePath;
        this.deleted = product.deleted;
    }

    validate(product: { name: string, price: number, unit: string, stock: number, description: string, imagePath: string }) {
        if (!product.name) throw new Error("Name is required.");
        if (!product.unit) throw new Error("Unit is required.");
        if (!product.description) throw new Error("Description is required.");
        if (!product.imagePath) throw new Error("Image path is required.");

        if (product.price <= 0) throw new Error("Price must be positive.");
        if (product.stock < 0) throw new Error("Stock must be non-negative.");
    }

    static from({ 
            name,
            price,
            unit,
            stock,
            description,
            imagePath,
            deleted
        }: ProductPrisma) {
        return new Product({ 
            name,
            price,
            unit,
            stock,
            description,
            imagePath,
            deleted
            // cartContainsProduct: CartContainsProduct.from(cartContainsProduct)
         });
    };

    getName(): string {
        return this.name
    }

    getPrice(): number {
        return this.price;
    }

    getUnit(): string {
        return this.unit
    }

    getStock(): number {
        return this.stock;
    }
    setStock(stock: number): void {
        if (stock < 0) throw new Error("Out of stock.");
        this.stock = stock;
    }

    getDescription(): string {
        return this.description
    }

    getImagePath(): string {
        return this.imagePath
    }

    getDeleted(): boolean {
        return this.deleted
    }

    equal(newProduct: Product) {
        return (
            newProduct.name === this.name &&
            newProduct.price === this.price &&
            newProduct.unit === this.unit && // the equals method just checks if the data types of each attribute is the same as defined in the constructor            newProduct.stock === this.stock&&
            newProduct.description === this.description &&
            newProduct.imagePath === this.imagePath &&
            newProduct.deleted === this.deleted
        )
    }
}