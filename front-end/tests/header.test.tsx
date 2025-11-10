import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Header from "../components/header";
import React from "react";

window.React = React;

jest.mock('next/router', () => ({
  useRouter() {
    return ({
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      locale: 'en',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn()
      },
      beforePopState: jest.fn(() => null),
      prefetch: jest.fn(() => null)
    });
  },
}));

jest.mock('next-i18next', () => ({
    // this mock makes sure any components using the translate hook can use it without a warning being shown
    useTranslation: () => {
      return {
        // or with TypeScript:
        t: (i18nKey: string) => {
          if (i18nKey === 'header.nav.home') return "Home";
          if (i18nKey === 'header.nav.cart') return "Cart";
          if (i18nKey === 'header.nav.profile') return "Profile";
          if (i18nKey === 'header.nav.login') return "Login";
          if (i18nKey === 'header.nav.logout') return "Logout";
          if (i18nKey === 'header.nav.language') return "Language";
        },
        i18n: {
          changeLanguage: () => new Promise(() => {}),
        },
      };
    },
    initReactI18next: {
      type: '3rdParty',
      init: () => {},
    }
}));

afterEach(() => {
  sessionStorage.clear();
});

test('Given a guest; When he wants to see header ; Then the header is rendered with appropriate links.', async () => {
  // GIVEN
  sessionStorage.setItem('loggedInCustomer', '{"username": "guest"}');

  // WHEN
  render(<Header highlightedTitle={'Home'} />);

  // THEN
  expect(screen.getByText('VESO'));

  // https://stackoverflow.com/questions/52783144/how-do-you-test-for-the-non-existence-of-an-element-using-jest-and-react-testing
  expect(screen.queryByText('Home')).toBeInTheDocument();
  expect(screen.queryByText('Login')).toBeInTheDocument();

  expect(screen.queryByText('Cart')).not.toBeInTheDocument();
  expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  expect(screen.queryByText('Logout')).not.toBeInTheDocument();

  expect(screen.getByText('Language'));
  expect(screen.getByText('English'));
});

test('Given an admin; When he wants to see header ; Then the header is rendered with appropriate links.', async () => {
  // GIVEN
  sessionStorage.setItem('loggedInCustomer', '{"username": "admin"}');

  // WHEN
  render(<Header highlightedTitle={'Home'} />);

  // THEN
  expect(screen.getByText('VESO'));

  expect(screen.queryByText('Home')).toBeInTheDocument();
  expect(screen.queryByText('Profile')).toBeInTheDocument();
  expect(screen.queryByText('Logout')).toBeInTheDocument();
  
  expect(screen.queryByText('Login')).not.toBeInTheDocument();
  expect(screen.queryByText('Cart')).not.toBeInTheDocument();

  expect(screen.getByText('Language'));
  expect(screen.getByText('English'));
});

test('Given a customer; When he wants to see header ; Then the header is rendered with appropriate links.', async () => {
  // GIVEN
  sessionStorage.setItem('loggedInCustomer', '{"username": "customer"}');

  // WHEN
  render(<Header highlightedTitle={'Home'} />);

  // THEN
  expect(screen.getByText('VESO'));

  expect(screen.queryByText('Home')).toBeInTheDocument();
  expect(screen.queryByText('Profile')).toBeInTheDocument();
  expect(screen.queryByText('Logout')).toBeInTheDocument();
  expect(screen.queryByText('Cart')).toBeInTheDocument();
  
  expect(screen.queryByText('Login')).not.toBeInTheDocument();

  expect(screen.getByText('Language'));
  expect(screen.getByText('English'));
});


test('Given a header; When being on the home page; Then only that page is highlighted in the header.', async () => {
  // GIVEN
  sessionStorage.setItem('loggedInCustomer', '{"username": "customer"}');

  // WHEN
  render(<Header highlightedTitle={'Home'} />);

  // THEN
  expect(screen.getByText('Home')).toHaveAttribute('class', expect.stringContaining('bg-[green]'));
  expect(screen.getByText('Profile')).not.toHaveAttribute('class', expect.stringContaining('bg-[green]'));
  expect(screen.getByText('Logout')).not.toHaveAttribute('class', expect.stringContaining('bg-[green]'));
  expect(screen.getByText('Cart')).not.toHaveAttribute('class', expect.stringContaining('bg-[green]'));
});


test('Given a header; When being on the profile page; Then only that page is highlighted in the header.', async () => {
  // GIVEN
  sessionStorage.setItem('loggedInCustomer', '{"username": "customer"}');

  // WHEN
  render(<Header highlightedTitle={'Profile'} />);

  // THEN
  expect(screen.getByText('Home')).not.toHaveAttribute('class', expect.stringContaining('bg-[green]'));
  expect(screen.getByText('Profile')).toHaveAttribute('class', expect.stringContaining('bg-[green]'));
  expect(screen.getByText('Logout')).not.toHaveAttribute('class', expect.stringContaining('bg-[green]'));
  expect(screen.getByText('Cart')).not.toHaveAttribute('class', expect.stringContaining('bg-[green]'));
});


test('Given a header; When being on the cart page; Then only that page is highlighted in the header.', async () => {
  // GIVEN
  sessionStorage.setItem('loggedInCustomer', '{"username": "customer"}');

  // WHEN
  render(<Header highlightedTitle={'Cart'} />);

  // THEN
  expect(screen.getByText('Home')).not.toHaveAttribute('class', expect.stringContaining('bg-[green]'));
  expect(screen.getByText('Profile')).not.toHaveAttribute('class', expect.stringContaining('bg-[green]'));
  expect(screen.getByText('Logout')).not.toHaveAttribute('class', expect.stringContaining('bg-[green]'));
  expect(screen.getByText('Cart')).toHaveAttribute('class', expect.stringContaining('bg-[green]'));
});


test('Given a header; When being on the login page; Then only that page is highlighted in the header.', async () => {
  // GIVEN
  sessionStorage.setItem('loggedInCustomer', '{"username": "guest"}');

  // WHEN
  render(<Header highlightedTitle={'Login'} />);

  // THEN
  expect(screen.getByText('Home')).not.toHaveAttribute('class', expect.stringContaining('bg-[green]'));
  expect(screen.getByText('Login')).toHaveAttribute('class', expect.stringContaining('bg-[green]'));
});