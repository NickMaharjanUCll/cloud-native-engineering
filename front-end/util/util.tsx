import { Customer } from "@/types";

const getLoggedInCustomer = (): Customer => {
  try {
    let loggedInCustomer: Customer | string | null = sessionStorage.getItem('loggedInCustomer');
    if (loggedInCustomer) {
      loggedInCustomer = JSON.parse(loggedInCustomer) as Customer;
    } else {
      loggedInCustomer = { username: 'guest', role: 'guest'} as Customer; 
    }
  
    return loggedInCustomer;

  } catch (error) {
      return { username: 'guest', role: 'guest' } as Customer; // Q& After adding this try catch, I got hydration failed error. Before it complained that session storage is not defined.
  }

}

const dateToString = (date: Date, language: string): string => {
  date = new Date(date);
  let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
  let month = new Intl.DateTimeFormat(language, { month: 'long' }).format(date);
  let day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
  let hour = new Intl.DateTimeFormat('eu', { hour: '2-digit' }).format(date);
  let minute = new Intl.DateTimeFormat('eu', { minute: '2-digit' }).format(date);

  return `${day} ${month} ${year} at ${hour}:${minute}`;
}

const Util = {
 getLoggedInCustomer,
 dateToString
};

export default Util;

