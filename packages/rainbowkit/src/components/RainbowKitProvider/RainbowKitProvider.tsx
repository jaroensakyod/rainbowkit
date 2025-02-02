import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { cssStringFromTheme } from '../../css/cssStringFromTheme';
import { ThemeVars } from '../../css/sprinkles.css';
import { lightTheme } from '../../themes/lightTheme';
import { TransactionStoreProvider } from '../../transactions/TransactionStoreContext';
import { AppContext, defaultAppInfo } from './AppContext';
import { CoolModeContext } from './CoolModeContext';
import {
  RainbowKitChain,
  RainbowKitChainContext,
} from './RainbowKitChainContext';
import { ShowRecentTransactionsContext } from './ShowRecentTransactionsContext';
import { provideRainbowKitChains } from './provideRainbowKitChains';

const ThemeIdContext = createContext<string | undefined>(undefined);

const anonymousDataAttribute = 'data-rk';
const idDataAttribute = 'data-rk-id';

const createThemeRootProps = (id: string | undefined) =>
  id ? { [idDataAttribute]: id } : { [anonymousDataAttribute]: '' };

const createThemeRootSelector = (id: string | undefined) =>
  id ? `[${idDataAttribute}="${id}"]` : `[${anonymousDataAttribute}]`;

export const useThemeRootProps = () => {
  const id = useContext(ThemeIdContext);
  return createThemeRootProps(id);
};

export type Theme =
  | ThemeVars
  | {
      lightMode: ThemeVars;
      darkMode: ThemeVars;
    };

export interface RainbowKitProviderProps {
  chains: RainbowKitChain[];
  id?: string;
  children: ReactNode;
  theme?: Theme | null;
  showRecentTransactions?: boolean;
  appInfo?: { appName?: string; learnMoreUrl?: string };
  coolMode?: boolean;
}

const defaultTheme = lightTheme();

export function RainbowKitProvider({
  chains,
  id,
  theme = defaultTheme,
  children,
  appInfo,
  showRecentTransactions = false,
  coolMode = false,
}: RainbowKitProviderProps) {
  const rainbowkitChains = useMemo(
    () => provideRainbowKitChains(chains),
    [chains]
  );

  if (typeof theme === 'function') {
    throw new Error(
      'A theme function was provided to the "theme" prop instead of a theme object. You must execute this function to get the resulting theme object.'
    );
  }

  const selector = createThemeRootSelector(id);
  const appContext = {
    ...defaultAppInfo,
    ...appInfo,
  };

  return (
    <RainbowKitChainContext.Provider value={rainbowkitChains}>
      <CoolModeContext.Provider value={coolMode}>
        <ShowRecentTransactionsContext.Provider value={showRecentTransactions}>
          <TransactionStoreProvider>
            <AppContext.Provider value={appContext}>
              <ThemeIdContext.Provider value={id}>
                {theme ? (
                  <div {...createThemeRootProps(id)}>
                    <style>
                      {[
                        `${selector}{${cssStringFromTheme(
                          'lightMode' in theme ? theme.lightMode : theme
                        )}}`,

                        'darkMode' in theme
                          ? `@media(prefers-color-scheme:dark){${selector}{${cssStringFromTheme(
                              theme.darkMode,
                              { extends: theme.lightMode }
                            )}}}`
                          : null,
                      ].join('')}
                    </style>
                    {children}
                  </div>
                ) : (
                  children
                )}
              </ThemeIdContext.Provider>
            </AppContext.Provider>
          </TransactionStoreProvider>
        </ShowRecentTransactionsContext.Provider>
      </CoolModeContext.Provider>
    </RainbowKitChainContext.Provider>
  );
}
