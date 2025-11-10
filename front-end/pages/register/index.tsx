import Header from "@/components/header";
import CustomerService from "@/services/CustomerService";
import { StatusMessage } from "@/types";
import util from "@/util/util";
import { useRouter } from "next/router";
import { useState } from "react";

const Login: React.FC = () => {
    const [username, setUsername] = useState("Matej444");
    const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
    const [password, setPassword] = useState("m@t3j-v3s3l");
    const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
    const [unhidePassword, setUnhidePassword] = useState<boolean>(false);
    const [securityQuestion, setSecurityQuestion] = useState("What is the name of the best friend from childhood?");
    const [securityQuestionErrorMessage, setSecurityQuestionErrorMessage] = useState("");
    const [firstName, setFirstName] = useState("Matej");
    const [firstNameErrorMessage, setFirstNameErrorMessage] = useState("");
    const [lastName, setLastName] = useState("Vesel");
    const [lastNameErrorMessage, setLastNameErrorMessage] = useState("");
    const [phone, setPhone] = useState<number>(123456789);
    const [phoneErrorMessage, setPhoneErrorMessage] = useState("");
    const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
    
    const router = useRouter();

    const clearErrorMessages = () => {
        setUsernameErrorMessage("");
        setPasswordErrorMessage("");
        setSecurityQuestionErrorMessage("");
        setFirstNameErrorMessage("");
        setLastNameErrorMessage("");
        setPhoneErrorMessage("");
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

        if (!securityQuestion || securityQuestion.trim() === "") {
            setSecurityQuestionErrorMessage("Security question is required.");
            result = false;
        }

        if (!firstName || firstName.trim() === "") {
            setFirstNameErrorMessage("First name is required.");
            result = false;
        }

        if (!lastName || lastName.trim() === "") {
            setLastNameErrorMessage("Last name is required.");
            result = false;
        }

        if (!phone) {
            setPhoneErrorMessage("Phone is required.");
            result = false;
        } else if (phone.toString().length > 10) {
            setPhoneErrorMessage("Phone number is too long.");
            result = false;
        }

        return result;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearErrorMessages();

        if (!valid()) return;

        const customer = { username, password, securityQuestion, firstName, lastName, phone, role: 'customer' };
        const response = await CustomerService.registerCustomer(customer);

        if (response.status === 200) {
            setStatusMessages([{ message: `Registered successfully. Redirecting to login page...`, type: "success" }]);
            setTimeout(() => router.push("/login"), 1000);
        } else {
            const { message } = await response.json();
            setStatusMessages([{ message, type: 'error' }]);
        }
    };

    return (
        <>
            <Header highlightedTitle="Login" />
            <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10 px-4">
                {util.getLoggedInCustomer().username !== 'guest' && (
                    <p className="text-red-500 font-bold">You are not authorized to access this resource.</p>
                )}

                {util.getLoggedInCustomer().username === 'guest' && (
                    <>
                        {statusMessages.length > 0 && (
                            <section className="mb-6 w-full max-w-xl">
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

                        <p className="text-xl font-semibold mb-6">Registration Form</p>

                        <form
                            onSubmit={handleSubmit}
                            className="bg-white p-6 rounded-lg shadow-md w-full max-w-xl space-y-6"
                        >
                            <div>
                                <label htmlFor="nameInput" className="block mb-1 font-medium">Username</label>
                                <input
                                    type="text"
                                    id="nameInput"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                />
                                {usernameErrorMessage && <p className="text-sm text-red-600 mt-1">{usernameErrorMessage}</p>}
                            </div>

                            <div>
                                <label htmlFor="passwordInput" className="block mb-1 font-medium">Password</label>
                                <input
                                    type={unhidePassword ? "text" : "password"}
                                    id="passwordInput"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                />
                                {passwordErrorMessage && <p className="text-sm text-red-600 mt-1">{passwordErrorMessage}</p>}
                                <button
                                    type="button"
                                    onClick={() => setUnhidePassword(!unhidePassword)}
                                    className="mt-2 text-sm text-blue-600 hover:underline"
                                >
                                    {unhidePassword ? "Hide password" : "Show password"}
                                </button>
                            </div>

                            <div>
                                <label htmlFor="securityQuestionInput" className="block mb-1 font-medium">Security Question</label>
                                <input
                                    type="text"
                                    id="securityQuestionInput"
                                    value={securityQuestion}
                                    onChange={(e) => setSecurityQuestion(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                />
                                {securityQuestionErrorMessage && <p className="text-sm text-red-600 mt-1">{securityQuestionErrorMessage}</p>}
                            </div>

                            <div>
                                <label htmlFor="firstNameInput" className="block mb-1 font-medium">First Name</label>
                                <input
                                    type="text"
                                    id="firstNameInput"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                />
                                {firstNameErrorMessage && <p className="text-sm text-red-600 mt-1">{firstNameErrorMessage}</p>}
                            </div>

                            <div>
                                <label htmlFor="lastNameInput" className="block mb-1 font-medium">Last Name</label>
                                <input
                                    type="text"
                                    id="lastNameInput"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                />
                                {lastNameErrorMessage && <p className="text-sm text-red-600 mt-1">{lastNameErrorMessage}</p>}
                            </div>

                            <div>
                                <label htmlFor="phoneInput" className="block mb-1 font-medium">Phone</label>
                                <input
                                    type="number"
                                    id="phoneInput"
                                    value={phone}
                                    onChange={(e) => setPhone(Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                />
                                {phoneErrorMessage && <p className="text-sm text-red-600 mt-1">{phoneErrorMessage}</p>}
                            </div>

                            <div>
                                <input
                                    type="submit"
                                    value="Register!"
                                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded font-semibold cursor-pointer transition"
                                />
                            </div>
                        </form>
                    </>
                )}
            </main>
        </>
    );
};

export default Login;