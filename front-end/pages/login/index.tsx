import Header from "@/components/header";
import CustomerService from "@/services/CustomerService";
import { StatusMessage } from "@/types";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import useInterval from "use-interval";

const Login: React.FC = () => {
    const [username, setUsername] = useState("Matej333");
    const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
    const [password, setPassword] = useState("m@t3j-v3s3l");
    const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
    const [unhidePassword, setUnhidePassword] = useState<boolean>(false);
    const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
    const router = useRouter();

    const clearErrorMessages = () => {
        setUsernameErrorMessage("");
        setPasswordErrorMessage("");
        setStatusMessages([]);
    };

    const valid = (): boolean => {
        let result = true;

        if (!username || username.trim() === "") {
            setUsernameErrorMessage("Username is required.");
            result = false;
        }

        if (!password || password.trim() === "") {
            setPasswordErrorMessage("Password is required.");
            result = false;
        }

        return result;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearErrorMessages();

        if (!valid()) return;

        const customer = { username, password };
        const response = await CustomerService.loginCustomer(customer);

        if (response.status === 200) {
            setStatusMessages([{ message: "Redirecting...", type: "success" }]);

            const customer = await response.json();
            sessionStorage.setItem("loggedInCustomer", JSON.stringify({
                token: customer.token,
                fullname: customer.fullname,
                username: customer.username,
                role: customer.role,
            }));

            setTimeout(() => {
                router.push("/");
            }, 500);
        } else if (response.status === 401) {
            const { message } = await response.json();
            setStatusMessages([{ message, type: "error" }]);
        } else {
            setStatusMessages([{ message: "An error has occurred. Please try again later.", type: "error" }]);
        }
    };

    return (
        <>
            <Header highlightedTitle="Login" />
            <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10 px-4">
                {statusMessages.length > 0 && (
                    <section className="mb-6 w-full max-w-md">
                        <ul>
                            {statusMessages.map(({ message, type }, index) => (
                                <li
                                    key={index}
                                    className={`p-3 rounded mb-2 text-sm font-medium ${
                                        type === "error"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-green-100 text-green-700"
                                    }`}
                                >
                                    {message}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <p className="mb-6 text-sm text-center">
                    Not logged in yet?{" "}
                    <Link href="/register" className="text-blue-600 underline hover:text-blue-800">
                        Register
                    </Link>
                </p>

                <form
                    onSubmit={(event) => handleSubmit(event)}
                    className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-6"
                >
                    <div>
                        <label htmlFor="nameInput" className="block mb-1 font-medium">
                            Username
                        </label>
                        <input
                            type="text"
                            id="nameInput"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                        {usernameErrorMessage && (
                            <p className="text-sm text-red-600 mt-1">{usernameErrorMessage}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="passwordInput" className="block mb-1 font-medium">
                            Password
                        </label>
                        <input
                            type={unhidePassword ? "text" : "password"}
                            id="passwordInput"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                        {passwordErrorMessage && (
                            <p className="text-sm text-red-600 mt-1">{passwordErrorMessage}</p>
                        )}
                        <button
                            type="button"
                            onClick={() => setUnhidePassword(!unhidePassword)}
                            className="mt-2 text-sm text-blue-600 hover:underline"
                        >
                            {unhidePassword ? "Hide password" : "Show password"}
                        </button>
                    </div>

                    <div>
                        <input
                            type="submit"
                            value="Login!"
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded font-semibold cursor-pointer transition"
                        />
                    </div>
                </form>
            </main>
        </>
    );
};

export default Login;