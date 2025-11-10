import Image from 'next/image';
import type { CartItem, Product } from '../types';
import util from '@/util/util';

type Props = {
    products: Product[];
    cartItems: CartItem[];
    addToCart: (productName: string) => void;
};

const Product: React.FC<Props> = ({ products, cartItems, addToCart }) => {
    const getQuantity = (productName: string) => {
        try {
            const quantity: number = cartItems.find((cartItem) => cartItem.product.name === productName)?.quantity || 0;
            return quantity;
        } catch (error) {
            return null;
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
                <article
                    key={index}
                    className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
                >
                    <Image
                        src={product.imagePath}
                        width={150}
                        height={150}
                        alt={product.name}
                        className="rounded-md object-cover mb-4"
                    />

                    <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                    <p className="text-gray-700 mb-1">
                        {product.price} $ / {product.unit}
                    </p>

                    {product.deleted && (
                        <p className="text-sm text-red-600 font-medium mt-1">Item removed</p>
                    )}

                    <p className="text-sm text-gray-500 mb-2">Stock: {product.stock}</p>

                    {!['guest', 'admin'].includes(util.getLoggedInCustomer().username) && (
                        <>
                            <button
                                onClick={() => addToCart(product.name)}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Add to cart
                            </button>

                            <p className="text-sm text-gray-600 mt-2">
                                Quantity: {getQuantity(product.name)}
                            </p>
                        </>
                    )}
                </article>
            ))}
        </div>
    );
};

export default Product;