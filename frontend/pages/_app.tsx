import React, { ReactNode } from 'react';
import { AppProps } from 'next/app';
import { AuthProvider } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import '../styles/globals.css';

interface MyAppProps extends AppProps {
  Component: AppProps['Component'] & { name?: string };
}

function MyApp({ Component, pageProps }: MyAppProps) {
  const isAuthPage = Component.name === 'Login' || Component.name === 'Register';

  return (
    <AuthProvider>
      {isAuthPage ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </AuthProvider>
  );
}

export default MyApp;
