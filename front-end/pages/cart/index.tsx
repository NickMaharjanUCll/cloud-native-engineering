import Header from "@/components/header";
import { useState } from "react";
import CartItem from "@/components/cartItem";
import CustomerService from "@/services/CustomerService";
import useSWR, { mutate } from "swr";
import { useRouter } from "next/router";

const Cart: React.FC = () => {
    const [errorMessage, setErrorMessage] = useState<string>("");
    const router = useRouter();

    const getCartItemsAndTotalCartPrice = async () => {
        const responses = Promise.all([
            CustomerService.getCartItemsByCustomerUsername(),
            CustomerService.getTotalCartPriceByCustomerUsername()
        ]);

        const [cartItemsResponse, totalCartPriceResponse] = await responses;

        if (!cartItemsResponse.ok) {
            if (cartItemsResponse.status === 401) {
                setErrorMessage("You are not authorized to access this resource.");
            } else {
                setErrorMessage(cartItemsResponse.statusText);
            }
            return;
        }

        let cartItems = await cartItemsResponse.json();
        let totalCartPrice = await totalCartPriceResponse.json();

        cartItems.sort((a: CartItem, b: CartItem) => a.product.name < b.product.name ? -1 : 1);

        return {
            cartItems,
            totalCartPrice
        };
    };

    const { data, isLoading } = useSWR(
        "getCartItemsAndTotalCartPrice",
        getCartItemsAndTotalCartPrice
    );

    const clearCart = async () => {
        await CustomerService.clearCart();
        mutate("getCartItemsAndTotalCartPrice", getCartItemsAndTotalCartPrice());
    };

    const deleteCartItem = async (cartItem: CartItem) => {
        await CustomerService.deleteCartItem(cartItem.product.name);
        mutate("getCartItemsAndTotalCartPrice", getCartItemsAndTotalCartPrice());
    };

    const changeQuantity = async (cartItem: CartItem, change: string) => {
        await CustomerService.createOrUpdateCartItem(cartItem.product.name, change);
        mutate("getCartItemsAndTotalCartPrice", getCartItemsAndTotalCartPrice());
    };

    return (
        <>
            <Header highlightedTitle="Cart" />
            <main className="min-h-screen bg-gray-100 text-gray-800 p-6 space-y-8">
                {errorMessage ? (
                    <p className="text-red-600 font-semibold text-center">{errorMessage}</p>
                ) : (
                    <>
                        {isLoading && <p className="text-center text-gray-500">Loading...</p>}

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={clearCart}
                                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded transition"
                            >
                                Clear Cart
                            </button>
                            <button
                                onClick={() => router.push(`/cart/order`)}
                                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded transition"
                            >
                                Place Order
                            </button>
                        </div>

                        {data && (
                            <p className="text-center text-xl font-semibold text-gray-700">
                                Total price: <span className="text-black">{data.totalCartPrice} $</span>
                            </p>
                        )}

                        <section>
                            {data && (
                                <CartItem
                                    cartItems={data.cartItems}
                                    changeQuantity={changeQuantity}
                                    deleteCartItem={deleteCartItem}
                                />
                            )}
                        </section>
                    </>
                )}
            </main>
        </>
    );
};

export default Cart;