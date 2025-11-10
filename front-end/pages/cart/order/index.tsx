import Header from "@/components/header";
import CustomerService from "@/services/CustomerService";
import OrderService from "@/services/OrderService";
import { Orderr } from "@/types";

import { useRouter } from "next/router";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import useInterval from "use-interval";


const Order: React.FC = () => {
    const [errorMessage, setErrorMessage] = useState<string>("");

    // const getCustomerUsername = () => sessionStorage.getItem("loggedInUser") || "guest";

    const [firstName, setFirstName] = useState("Matej");
    const [firstNameErrorMessage, setFirstNameErrorMessage] = useState("");

    const [lastName, setLastName] = useState("Vesel");
    const [lastNameErrorMessage, setLastNameErrorMessage] = useState("");

    const [phone, setPhone] = useState("00 32 455 23 532");
    const [phoneErrorMessage, setPhoneErrorMessage] = useState("");

    const [statusMessage, setStatusMessage] = useState("");

    const router = useRouter();

    const getTotalCartPrice = async () => {
        const responses = Promise.all([
            CustomerService.getTotalCartPriceByCustomerUsername()
        ]);

        const [totalCartPriceResponse] = await responses;

        if (!totalCartPriceResponse.ok) {
            if (totalCartPriceResponse.status === 401) {
                setErrorMessage("You are not authorized to access this resource.");
            } else {
                setErrorMessage(totalCartPriceResponse.statusText);
            };

            return;
        }

        let totalCartPrice = await totalCartPriceResponse.json();
        // totalCartPrice = totalCartPrice.response

        return {
            totalCartPrice
        };
    };

    const { data, isLoading } = useSWR(
        "getTotalCartPrice",
        getTotalCartPrice
    );

    // useInterval(() => {
    //     mutate("getTotalCartPrice", getTotalCartPrice());
    // }, 5000);


    const clearErrorMessages = () => {
        setFirstNameErrorMessage("");
        setLastNameErrorMessage("");
        setPhoneErrorMessage("");
    };

    const valid = (): boolean => {
        let result = true;

        if (!firstName || !firstName.trim()) {
            setFirstNameErrorMessage("First name is required.");
            result = false;
        };

        if (!lastName || !lastName.trim()) {
            setLastNameErrorMessage("Last name is required.");
            result = false;
        };

        const phoneRegex = new RegExp(String.raw`^00(\s[1-9][0-9]+){2,}$`);
        if (!phone || !phone.trim()) {
            setPhoneErrorMessage("Phone number is required.");
            result = false;
        } else if (!phone.match(phoneRegex)) {
            setPhoneErrorMessage("Invalid format.");
            result = false;
        }   

        return result;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        clearErrorMessages();

        if (!valid()) {
            return;
        };

        const date: Date = new Date();
        // const date: Date = new Date("2024-01-19 14:00:12");
        const order: Orderr = { date };
        const response = await OrderService.placeOrder(order);
        if (response.status === 200) setStatusMessage("Order placed successfully.");
        if (response.status !== 200) {
            const { message } = await response.json();
            setStatusMessage(message);
        }
        
        mutate("getTotalCartPrice", getTotalCartPrice());

    };

    return (
  <>
    <Header highlightedTitle="Cart" />

    <main className="min-h-screen bg-gray-100 p-6 text-gray-800">
      {errorMessage ? (
        <p className="text-red-600 font-semibold text-center">{errorMessage}</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow space-y-6"
        >
          <h2 className="text-2xl font-bold text-center">Place Your Order</h2>

          <div>
            <label htmlFor="firstNameInput" className="block mb-1 font-medium">
              First name:
            </label>
            <input
              type="text"
              id="firstNameInput"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {firstNameErrorMessage && (
              <p className="text-sm text-red-500 mt-1">{firstNameErrorMessage}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastNameInput" className="block mb-1 font-medium">
              Last name:
            </label>
            <input
              type="text"
              id="lastNameInput"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {lastNameErrorMessage && (
              <p className="text-sm text-red-500 mt-1">{lastNameErrorMessage}</p>
            )}
          </div>

          <div>
            <label htmlFor="phoneNameInput" className="block mb-1 font-medium">
              Phone:
            </label>
            <input
              type="text"
              id="phoneNameInput"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="00 32 285 56 12 64"
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {phoneErrorMessage && (
              <p className="text-sm text-red-500 mt-1">{phoneErrorMessage}</p>
            )}
          </div>

          {data && (
            <div className="text-lg font-semibold text-center text-gray-700">
              Total price: <span className="text-black">{data.totalCartPrice} $</span>
            </div>
          )}

          <div className="flex flex-col items-center gap-3">
            <input
              type="submit"
              value="Place order"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded cursor-pointer transition"
            />
            {statusMessage && (
              <p className="text-sm text-blue-600 font-medium">{statusMessage}</p>
            )}
          </div>
        </form>
      )}
    </main>
  </>
);
};

export default Order;