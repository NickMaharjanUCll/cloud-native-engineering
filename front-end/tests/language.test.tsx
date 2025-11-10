import { render, screen } from '@testing-library/react'
import Language from "../components/language";
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
        t: (i18nKey: string) => "Language",
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



// GIVEN
test('Given languages; When you want to change language; Then language is rendered.', async () => {
    // WHEN
    render(<Language />);

    // THEN
    expect(screen.getByText('Language'));
    expect(screen.getByText('English'));
})