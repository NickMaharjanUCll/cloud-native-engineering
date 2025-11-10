import Link from "next/link";
import { useEffect, useState } from "react";
import { Customer, HighlightedTitle } from "@/types";
import util from "../util/util";

type HeaderProps = {
  highlightedTitle: HighlightedTitle;
};

const Header: React.FC<HeaderProps> = ({ highlightedTitle }) => {
  const [loggedInUser, setLoggedInUser] = useState<string>('guest');
  const [quote, setQuote] = useState<string>('');

  useEffect(() => {
    setLoggedInUser(util.getLoggedInCustomer().username);
    setQuote(sessionStorage.getItem('quote') || '');
  }, []);

  const logout = () => {
    sessionStorage.removeItem("loggedInCustomer");
    setLoggedInUser('guest');
  };

  const getQuote = (): string => {
    return sessionStorage.getItem('quote') || '';
  };

  return (
    <>
      <header className="bg-gray-900 text-white px-6 py-4 flex flex-wrap items-center justify-between shadow-md">
        <Link href="/" className="text-2xl font-bold text-green-400 hover:text-green-300 transition">
          VESO
        </Link>

        <nav className="flex flex-wrap gap-4 justify-center">
          <Link
            className={`hover:text-green-400 transition ${
              highlightedTitle === "Home" ? "text-green-400 font-semibold" : ""
            }`}
            href="/"
          >
            Home
          </Link>

          {!['guest', 'admin'].includes(loggedInUser) && (
            <Link
              className={`hover:text-green-400 transition ${
                highlightedTitle === "Cart" ? "text-green-400 font-semibold" : ""
              }`}
              href="/cart"
            >
              Cart
            </Link>
          )}

          {loggedInUser !== 'guest' && (
            <>
              <Link
                className={`hover:text-green-400 transition ${
                  highlightedTitle === "Profile" ? "text-green-400 font-semibold" : ""
                }`}
                href="/profile"
              >
                Profile
              </Link>

              <Link
                className={`hover:text-green-400 transition ${
                  highlightedTitle === "Orders" ? "text-green-400 font-semibold" : ""
                }`}
                href="/orders"
              >
                Orders
              </Link>
            </>
          )}

          {loggedInUser === 'guest' && (
            <Link
              className={`hover:text-green-400 transition ${
                highlightedTitle === "Login" ? "text-green-400 font-semibold" : ""
              }`}
              href="/login"
            >
              Login
            </Link>
          )}

          {loggedInUser !== 'guest' && (
            <Link
              className={`hover:text-green-400 transition ${
                highlightedTitle === "Logout" ? "text-green-400 font-semibold" : ""
              }`}
              href="#"
            >
              <p onClick={logout}>Logout</p>
            </Link>
          )}
        </nav>
      </header>

      <p className="text-center mt-2 text-sm italic text-gray-400">
        {quote && <em>{quote}</em>}
      </p>
    </>
  );
};

export default Header;