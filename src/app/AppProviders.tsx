import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { store } from '@/app/store';
import { ThemeProvider, StatusModalProvider } from '@/config/theme';
import { I18nProvider } from '@/shared/i18n/I18nProvider';
import { CollectionStoreProvider } from '@/features/collection-store/CollectionStore';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<Readonly<AppProvidersProps>> = ({ children }) => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <I18nProvider>
          <StatusModalProvider>
            <BrowserRouter>
              <Toaster position="top-right" richColors closeButton duration={2000} />
              <CollectionStoreProvider>{children}</CollectionStoreProvider>
            </BrowserRouter>
          </StatusModalProvider>
        </I18nProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default AppProviders;
