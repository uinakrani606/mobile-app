import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { signIn } from "next-auth/react";
import { toggleUser, toggleAuth } from '../store/themeConfigSlice';
import { useRouter } from 'next/router';
import BlankLayout from '@/components/Layouts/BlankLayout';
import { useTranslation } from 'react-i18next';
import IconMail from '@/components/Icon/IconMail';
import IconLockDots from '@/components/Icon/IconLockDots';
import IconGoogle from '@/components/Icon/IconGoogle';
import axios from 'axios';
import Swal from 'sweetalert2';

const LoginBoxed = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [email, setEmail] = useState<any>('');
    const [password, setPassword] = useState<any>('');
    const [hidden, setHidden] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        setHidden(false);
    }, [])

    const submitForm = async (e: any) => {
        e.preventDefault();
        if (email === "") {
            showMessage(t('Enter_your_email'), 'error');
        } else if (password === "") {
            showMessage(t('Enter_Your_Password'), 'error');
        } else {
            const response = await signIn('credentials', {
                email: email,
                password: password,
                redirect: false
            });
            if (!response?.error) {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/token`, {
                    username: email,
                    password: password
                },
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        }
                    })
                    .then(function (response: any) {
                        dispatch(toggleUser(response.data.user));
                        dispatch(toggleAuth(response.data.access_token));
                        const loginTime = new Date().getTime();
                        localStorage.setItem('login-time', loginTime.toString());
                        router.push('/');
                    })
            } else {
                showMessage(t('User_not_found'), 'error')
            }
        }
    };

    const showMessage = (msg: any, type = 'alert') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    return (
        <div>
            <div className="absolute inset-0 ">
                <img src="/assets/images/auth/bg-gradient-blue.png" alt="image" className="h-full w-full object-cover opacity-80" />
            </div>

            <div className={`relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-2 py-10 dark:bg-[#060818] sm:px-1 transition-all duration-300 ${hidden ? 'opacity-0' : ''}`}>
                <div className="relative w-full max-w-[530px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white px-4 py-20 backdrop-blur-lg dark:bg-black/50 max-w-[530px] lg:min-h-[658px]">
                        <div className="absolute end-6 top-6">
                            <Link href='/'><img className="inline w-8 ltr:-ml-1 rtl:-mr-1" src="/assets/images/venture_logo_2.png" alt="logo" />
                                <span className="hidden align-middle text-2xl  font-semibold  transition-all duration-300 ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light md:inline">{t('venture')}</span>
                            </Link>
                        </div>
                        <div className="mx-auto w-full max-w-[440px]">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">{t('signin')}</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">{t('Enter_your_email_and_password_to_login')}</p>
                            </div>
                            <form className="space-y-5 dark:text-white">
                                <div>
                                    <label htmlFor="Email">{t('email')} *</label>
                                    <div className="relative text-white-dark">
                                        <input id="Email" type="email" onChange={(e) => setEmail(e.target.value)} autoComplete='off' placeholder="Enter Email" className="form-input pl-10 placeholder:text-white-dark" />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconMail fill={true} />
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="Password">{t('password')} *</label>
                                    <div className="relative text-white-dark">
                                        <input id="Password" type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Enter Password" className="form-input pl-10 placeholder:text-white-dark" />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span>
                                    </div>
                                </div>
                                <button type="submit" onClick={submitForm} className="btn bg-primary text-white !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                                    {t('signin')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
LoginBoxed.getLayout = (page: any) => {
    return <BlankLayout>{page}</BlankLayout>;
};
export default LoginBoxed;
