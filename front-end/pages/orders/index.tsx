import Header from "@/components/header";
import CustomerService from "@/services/CustomerService";
import { Order } from "@/types";
import Util from "@/util/util";
import util from "@/util/util";
import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import useInterval from "use-interval";


const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>();

    const getOrdersByCustomerUsername = async () => {
        const response = await CustomerService.getOrdersByCustomerUsername();
        let result = await response.json();
        console.log('ORDERSS');
        console.log(result);
        // result = result.response;
        result = result.reverse()
        setOrders(result)
    };

    useEffect(() => {
        getOrdersByCustomerUsername()
    }, []);

    return (
  <>
    <Header highlightedTitle="Orders" />
    <main className="min-h-screen bg-gray-100 p-6 text-gray-800">
      <h1 className="text-2xl font-bold text-center mb-8">Your Orders</h1>

      <div className="space-y-6 max-w-2xl mx-auto">
        {orders &&
          orders.map((order: Order, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
            >
              <h2 className="text-lg font-semibold mb-3">
                Order {orders.length - index}
              </h2>
              <table className="w-full text-sm text-left">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-medium text-gray-600">Price:</td>
                    <td className="py-2 text-gray-800">{order.cart.totalPrice} $</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium text-gray-600">Date:</td>
                    <td className="py-2 text-gray-800">
                      {Util.dateToString(order.date, "en")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </main>
  </>
);
};

export default Orders;