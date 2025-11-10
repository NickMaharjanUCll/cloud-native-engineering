import { Product } from "../model/product";
import database from "./database";

const getAllProductsByDeleted = async (deleted: boolean): Promise<Product[]> => {
    try {
        const productPrisma = await database.product.findMany({
            where: {
                deleted: deleted
            }
        });

        return productPrisma.map((productPrisma) => Product.from(productPrisma));
    } catch (error) {
        console.log(error);
        throw new Error('Database error. See server logs for details.');
    }
};

const getProductByName = async (name: string): Promise<Product | null> => {
    try {
        const productPrisma = await database.product.findUnique({
            where: {
                name: name
            }
        });
        return productPrisma ? Product.from(productPrisma) : null;

    } catch (error) {
        console.log(error);
        throw new Error('Database error. See server logs for details.');
    }
};

const getProductsByNameContainingAndCaseInsensitive = async (name: string): Promise<Product[]> => {
    try {
        const productPrisma = await database.product.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive'
                }
            }
        });
        return productPrisma.map((productPrisma) => Product.from(productPrisma));

    } catch (error) {
        console.log(error);
        throw new Error('Database error. See server logs for details.');
    }
};

const updateProductStockByName = async (name: string, stock: number): Promise<String | null> => {
    try {
            await database.product.update({
            where: {
                name: name
            },
            data: {
                stock: stock
            }
        });
        return "Product's stock updated successfully.";

    } catch (error) {
        console.log(error);
        throw new Error('Database error. See server logs for details.');
    }
};

export default {
    getAllProductsByDeleted,
    getProductByName,
    updateProductStockByName,
    getProductsByNameContainingAndCaseInsensitive
};