import { Product } from "../../model/product";
import productDb from "../../repository/product.db";
import productService from "../../service/product.service";

const products: Product[] = [
    new Product({
        name: "Bread",
        price: 5,
        unit: "piece",
        stock: 25,
        description: "Rye bread is a type of bread made with various proportions of flour from rye grain. It can be light or dark in color, depending on the type of flour used and the addition of coloring agents, and is typically denser than bread made from wheat flour. Compared to white bread, it is higher in fiber, darker in color, and stronger in flavor. The world's largest exporter of rye bread is Poland.",
        imagePath: "bread.png",
        deleted: false
    }),
    new Product({
        name: "Mayonnaise",
        price: 7,
        unit: "piece",
        stock: 15,
        description: "Mayonnaise is an emulsion of oil, egg yolk, and an acid, either vinegar or lemon juice;[4] there are many variants using additional flavorings. The color varies from near-white to pale yellow, and its texture from a light cream to a thick gel.",
        imagePath: "mayonnaise.png",
        deleted: false
    })
];

let mockProductDbGetAllProductsByDeleted: jest.Mock;
let mockProductDbGetProductByName: jest.Mock;

beforeEach(() => {
    mockProductDbGetAllProductsByDeleted = jest.fn();
    mockProductDbGetProductByName = jest.fn();
});

test('Given there are products; When getting all products; Then all products are returned.', async () => {
    // GIVEN
    productDb.getAllProductsByDeleted = mockProductDbGetAllProductsByDeleted.mockReturnValue(products);

    // WHEN
    const receivedProducts: Product[] = await productService.getAllProducts({ username: 'guest', role: 'guest'});

    // THEN
    expect(mockProductDbGetAllProductsByDeleted).toHaveBeenCalledTimes(2);
    expect(mockProductDbGetAllProductsByDeleted).toHaveBeenCalledWith(true);
    expect(mockProductDbGetAllProductsByDeleted).toHaveBeenCalledWith(false);
    expect(receivedProducts).toEqual(products);
});

test('Given product exists; When getting product by name; Then product with that name is returned.', async () => {
    // GIVEN
    const productName: string = "Bread";
    productDb.getProductByName = mockProductDbGetProductByName.mockReturnValue(products[0]); // at index 0, there is Bread!

    // WHEN
    const receivedProduct = await productService.getProductByName(productName);

    // THEN
    expect(mockProductDbGetProductByName).toHaveBeenCalledTimes(1);
    expect(mockProductDbGetProductByName).toHaveBeenCalledWith(productName);
    expect(receivedProduct).toEqual(products[0]);
});

test('Given product does not exist; When getting product by name; Then error is thrown.', () => {
    // GIVEN
    const productName: string = "Bread";
    productDb.getProductByName = mockProductDbGetProductByName.mockReturnValue(null);

    // WHEN
    const getProductByName = () => productService.getProductByName(productName);

    // THEN
    expect(getProductByName).rejects.toThrow(`Product "${productName}" does not exist.`);
});