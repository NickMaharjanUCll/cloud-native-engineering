import Header from "@/components/header";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Product as ProductType} from "@/types";
import Product from "@/components/product";
import { useState } from "react";
import ProductService from "@/services/ProductService";
import CustomerService from "@/services/CustomerService";
import useSWR, { mutate } from "swr";
import util from "@/util/util";


const Home: React.FC = () => {
    const [query, setQuery] = useState('');
    // const [queryResults, setQueryResults] = useState<Manual[]>([]);
    const [statusMessage, setStatusMessage] = useState('');

    // SWR FETCHERS. -----------------------------
    const fetcherCartItems = async () => {
        const response = await CustomerService.getCartItemsByCustomerUsername();
        // console.log(await response.text());
        // console.log(await response.json());
        let result = await response.json();
        console.log('RESUUUUULLT');
        console.log(result);
        // result = result.items;
        return { result };
    };

    const fetcherAllProducts = async () => {
        // Because guest cannot use the secure path. But products have to be under secure path because I change functionality based on the token, which is a requirement.
        if (['guest'].includes(util.getLoggedInCustomer().username)) {
            return await fetcherSearchedProducts('*');
        }

        const response = await ProductService.getAllProducts();
        const result = await response.json();
        result.sort((a: ProductType, b: ProductType) => (a.name < b.name ? -1 : 1)); // Sort products based on descending name.
        return { result };
    };

    // Look away, shady things are going on here.
    const fetcherSearchedProducts = async (x?: string) => {
        let response;
        if (x === '*') {
            response = await ProductService.searchProducts(x);
        } else {
            response = await ProductService.searchProducts(query);
        }

        const result = await response.json();
        result.sort((a: ProductType, b: ProductType) => (a.name < b.name ? -1 : 1)); // Sort products based on descending name.
        return { result };
    };

    const { data: dataCartItems } = useSWR(
        // https://swr.vercel.app/docs/conditional-fetching
        // util.getLoggedInCustomer().username !== "guest" ? "cartItems" : null,
        !['guest', 'admin'].includes(util.getLoggedInCustomer().username) ? 'cartItems' : null,
        fetcherCartItems,
    );

    const {
        data: dataProducts,
        isLoading,
        error,
    } = useSWR(!query ? 'products' : null, fetcherAllProducts);

    const { data: dataSearchedProducts } = useSWR(
        query ? 'searchedProducts' : null,
        fetcherSearchedProducts,
    );

    const pooling = () => {
        mutate('products', fetcherAllProducts());

        if (!['guest', 'admin'].includes(util.getLoggedInCustomer().username)) {
            mutate('cartItems', fetcherCartItems());
        }

        if (query) {
            mutate('searchedProducts', fetcherSearchedProducts());
        }
    };

    // useInterval(pooling, 5000);

    const addToCart = async (productName: string) => {
        await CustomerService.createOrUpdateCartItem(productName, 'increase');
        console.log('HEREE');
        pooling();
        // mutate('cartItems', fetcherCartItems());

        console.log('DWON');
        console.log(dataCartItems?.result);
        console.log('DWON');
    };

    // Search form.
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        // Prevent page reload.
        event.preventDefault();

        // Clear status messages to prevent piling them up
        setStatusMessage('');

        if (!query) {
            setStatusMessage('Search string required.');
            return;
        }

        mutate('searchedProducts', fetcherSearchedProducts());
    };

    return (
  <>
    <Head>
      <title>VESO</title>
      <meta name="description" content="Courses app" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>

    <Header highlightedTitle="Home" />

    <main className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 text-gray-800 p-6 space-y-10">
      {['admin'].includes(util.getLoggedInCustomer().username) &&
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Username</th>
                <th className="px-6 py-3">Password</th>
                <th className="px-6 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Matej333", "m@t3j-v3s3l", "customer"],
                ["Roland333", "r0l@nd-d1m3-", "customer"],
                ["guest", "guest", "guest"],
                ["admin", "admin", "admin"]
              ].map(([user, pass, role]) => (
                <tr className="border-b" key={user}>
                  <td className="px-6 py-4">{user}</td>
                  <td className="px-6 py-4">{pass}</td>
                  <td className="px-6 py-4">{role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }

      <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-4">
        <form onSubmit={(event) => handleSubmit(event)} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="queryInput" className="text-sm font-medium">
              Search:
            </label>
            <input
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              id="queryInput"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Search
            </button>
            <button
              type="button"
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
              onClick={() => {
                setQuery('');
                setStatusMessage('');
              }}
            >
              Clear Search
            </button>
          </div>
        </form>

        {statusMessage && <p className="text-red-600 text-sm">{statusMessage}</p>}
      </div>

      {error && <p className="text-red-600 text-center">{error.messages}</p>}
      {isLoading && <p className="text-center text-gray-500">Loading...</p>}

      {['guest', 'admin'].includes(util.getLoggedInCustomer().username) && (
        <p className="text-center text-gray-600">Log in to shop!</p>
      )}

      {['admin'].includes(util.getLoggedInCustomer().username) && (
        <p className="text-center text-sm text-blue-700">Removed products are also shown for the admin.</p>
      )}

      <section className="grid gap-6">
        {(dataProducts || dataSearchedProducts) && (
          <Product
            products={!query ? dataProducts?.result : dataSearchedProducts?.result}
            addToCart={addToCart}
            cartItems={dataCartItems ? dataCartItems.result : []}
          />
        )}
      </section>
    </main>
  </>
);
};


export default Home;
