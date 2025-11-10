import type { CartItem } from '../types';
import Image from 'next/image';

type Props = {
    cartItems: Array<CartItem>;
    changeQuantity: (cartItem: CartItem, change: string) => void;
    deleteCartItem: (cartItem: CartItem) => void;
};

const CartItem: React.FC<Props> = ({ cartItems, changeQuantity, deleteCartItem }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cartItems.map((cartItem, index) => (
                <article
                    key={index}
                    className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
                >
                    <Image
                        src={cartItem.product.imagePath}
                        width={150}
                        height={150}
                        alt={cartItem.product.name}
                        className="rounded-md object-cover mb-4"
                    />

                    <h3 className="text-lg font-semibold mb-1">{cartItem.product.name}</h3>
                    <p className="text-gray-700 mb-1">
                        {cartItem.product.price} $ / {cartItem.product.unit}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                        Stock: {cartItem.product.stock}
                    </p>

                    <div className="flex items-center justify-center gap-3 my-2">
                        <button
                            onClick={() => changeQuantity(cartItem, "increase")}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        >
                            +
                        </button>
                        <button
                            onClick={() => changeQuantity(cartItem, "decrease")}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                        >
                            -
                        </button>
                    </div>

                    <button
                        onClick={() => deleteCartItem(cartItem)}
                        className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    >
                        DELETE
                    </button>

                    <p className="mt-3 text-sm text-gray-700">
                        Quantity: {cartItem.quantity}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                        Total: {(cartItem.product.price * cartItem.quantity).toFixed(2)} $
                    </p>
                </article>
            ))}
        </div>
    );
};

export default CartItem;