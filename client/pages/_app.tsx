import '../styles/globals.css';
import { AppProps } from 'next/app';
import { AppContext } from 'next/app';
import { ConfigProvider } from 'antd';
import buildClient from '../api/build-client';
import Header from '../components/header';

interface ExtendedAppProps extends AppProps {
  currentUser?: {
    id: string;
    email: string;
  };
}

const AppComponent = ({ Component, pageProps, currentUser }: ExtendedAppProps) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3b82f6',
          borderRadius: 6,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      }}
    >
      <div className="page-container">
        <Header currentUser={currentUser} />
        <main className="content-wrapper">
          <Component {...pageProps} />
        </main>
      </div>
    </ConfigProvider>
  );
};

AppComponent.getInitialProps = async (appContext: AppContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }

  return {
    pageProps,
    ...data
  };
};

export default AppComponent;
