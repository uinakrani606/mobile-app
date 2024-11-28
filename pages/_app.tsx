import type { AppProps } from 'next/app';
import { ReactElement, ReactNode, useEffect, useState } from 'react';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from '../store/index';
import { toggleAuth, toggleUser, toggleManagerSidebar, toggleManagerView, toggleNavigationView } from '../store/themeConfigSlice';
import Head from 'next/head';
import { IRootState } from '../store';
import { SessionProvider, signOut, useSession } from 'next-auth/react';
import { appWithI18Next } from 'ni18n';
import { ni18nConfig } from 'ni18n.config.ts'; 0
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import { NextPage } from 'next';
import axios from 'axios';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

const AppInner = ({ Component, pageProps, router }: AppPropsWithLayout) => {
    const getLayout = Component.getLayout ?? ((page: ReactElement) => <DefaultLayout>{page}</DefaultLayout>);
    const userData = useSelector((state: IRootState) => state.themeConfig.userLogin);
    const userAuth = useSelector((state: IRootState) => state.themeConfig.userAuth);
    const dispatch = useDispatch();
    const { status } = useSession();
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    const isMobileDevice = () => {
        if (typeof window !== 'undefined') {
            const userAgent = navigator.userAgent
            return /android|iphone|ipod|windows phone|blackberry|webos/i.test(userAgent);
        }
        return false;
    };
    useEffect(() => {
        // if (isMobileDevice()) {
        //     if (window.location.hostname !== 'mbl.venture.jakoda.dev') {
        //         window.location.href = process.env.MOBILE_URL || 'https://mbl.venture.jakoda.dev';
        //     }
        // } else {
        //     if (window.location.hostname === 'mbl.venture.jakoda.dev') {
        //         window.location.href = process.env.WEB_URL || 'https://venture.jakoda.dev';
        //     }
        // }
    }, []);
    
    console.log(isMobileDevice() ? 'Mobile device detected' : 'Not a mobile device');
    
    useEffect(() => {
        dispatch(toggleManagerSidebar());
        dispatch(toggleManagerView('manager'))
    }, []);

    useEffect(() => {
        if (router.pathname == '/booking') {
            dispatch(toggleNavigationView('booking'))
        }
        if (router.pathname == '/') {
            dispatch(toggleNavigationView('calendar'))
        }
        if (router.pathname == '/profile') {
            dispatch(toggleNavigationView('profile'))
        }
    }, [router.pathname])

    useEffect(() => {
        if (router.pathname === '/login') {
            return;
        }
        const fetchUserData = async () => {
            if (status == 'authenticated') {
                try {
                    const response = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
                        {},
                        {
                            headers: { Authorization: `Bearer ${authToken}` }
                        }
                    );
                } catch (error: any) {
                    if (error.response) {
                        if (error.response.status !== 200) {
                            await signOut({ callbackUrl: '/login' });
                        }
                    } else if (error.request) {
                        console.error("No response received, possibly API is offline: ", error.message);
                        await signOut({ callbackUrl: '/login' });
                    } else {
                        console.error("Error setting up request: ", error.message);
                    }
                }
            }
        };
        fetchUserData();
    }, [authToken, status]);

    useEffect(() => {
        if (status != 'loading') {
            if (status === 'authenticated') {
                const userString = localStorage.getItem('user') || JSON.stringify(userData);
                const userObject = typeof userString === 'string' ? JSON.parse(userString) : userString;
                const token = localStorage.getItem('authToken') || userAuth;
                dispatch(toggleAuth(token));
                dispatch(toggleUser(userObject));
                if (userObject?.user_id) {
                    if (router.pathname == '/login') {
                        router.push('/');
                    }
                }
            } else if (status == 'unauthenticated') {
                if (router.pathname !== '/login') {
                    router.push('/login');
                }
            }
        }
    }, [status, router, router.pathname])

    return (
        <>{getLayout(<Component {...pageProps} />)}</>
    );
};

const App = ({ Component, pageProps, router }: AppPropsWithLayout) => {
    return (
        <SessionProvider session={pageProps.session}>
            <Provider store={store}>
                <Head>
                    <title>Venture Scheduler by Babylon Tours</title>
                    <meta charSet="UTF-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no" />
                    <meta name="description" content="Venture Scheduler by Babylon Tours" />
                    <link rel="icon" href="/favicon.png" />
                </Head>
                <AppInner Component={Component} pageProps={pageProps} router={router} />
            </Provider>
        </SessionProvider>

    )
};

export default appWithI18Next(App, ni18nConfig);