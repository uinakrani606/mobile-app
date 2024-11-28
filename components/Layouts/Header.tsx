import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { IRootState } from '../../store';
import { useTranslation } from 'react-i18next';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import IconLogout from '../Icon/IconLogout';

const Overlay = () => (
    <div className="screen_loader animate__animated fixed inset-0 z-[60] flex justify-center items-center flex-col bg-[#fafafa] dark:bg-[#060818]">
        <svg width="64" height="64" viewBox="0 0 135 135" xmlns="http://www.w3.org/2000/svg" fill="#4361ee">
            <path d="M67.447 58c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10zm9.448 9.447c0 5.523 4.477 10 10 10 5.522 0 10-4.477 10-10s-4.478-10-10-10c-5.523 0-10 4.477-10 10zm-9.448 9.448c-5.523 0-10 4.477-10 10 0 5.522 4.477 10 10 10s10-4.478 10-10c0-5.523-4.477-10-10-10zM58 67.447c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10z">
                <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="-360 67 67" dur="2.5s" repeatCount="indefinite" />
            </path>
            <path d="M28.19 40.31c6.627 0 12-5.374 12-12 0-6.628-5.373-12-12-12-6.628 0-12 5.372-12 12 0 6.626 5.372 12 12 12zm30.72-19.825c4.686 4.687 12.284 4.687 16.97 0 4.686-4.686 4.686-12.284 0-16.97-4.686-4.687-12.284-4.687-16.97 0-4.687 4.686-4.687 12.284 0 16.97zm35.74 7.705c0 6.627 5.37 12 12 12 6.626 0 12-5.373 12-12 0-6.628-5.374-12-12-12-6.63 0-12 5.372-12 12zm19.822 30.72c-4.686 4.686-4.686 12.284 0 16.97 4.687 4.686 12.285 4.686 16.97 0 4.687-4.686 4.687-12.284 0-16.97-4.685-4.687-12.283-4.687-16.97 0zm-7.704 35.74c-6.627 0-12 5.37-12 12 0 6.626 5.373 12 12 12s12-5.374 12-12c0-6.63-5.373-12-12-12zm-30.72 19.822c-4.686-4.686-12.284-4.686-16.97 0-4.686 4.687-4.686 12.285 0 16.97 4.686 4.687 12.284 4.687 16.97 0 4.687-4.685 4.687-12.283 0-16.97zm-35.74-7.704c0-6.627-5.372-12-12-12-6.626 0-12 5.373-12 12s5.374 12 12 12c6.628 0 12-5.373 12-12zm-19.823-30.72c4.687-4.686 4.687-12.284 0-16.97-4.686-4.686-12.284-4.686-16.97 0-4.687 4.686-4.687 12.284 0 16.97 4.686 4.687 12.284 4.687 16.97 0z">
                <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="360 67 67" dur="8s" repeatCount="indefinite" />
            </path>
        </svg>
        <p className='pt-2 text-xl'>Signing you out. Goodbye!</p>
    </div>
);

const Header = () => {
    const router = useRouter();
    const userData = useSelector((state: IRootState) => state.themeConfig.userLogin);
    const [profilePic, setProfilePic] = useState("/assets/images/profile.png");
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [isOverlayVisible, setOverlayVisible] = useState(false);
    const active = useSelector((state: IRootState) => state.themeConfig.NavigationView);


    useEffect(() => {
        if (userData.profile_pic != "" || userData.profile_pic != null) {
            setProfilePic(userData.profile_pic);
        }
    }, [userData.profile_pic])

    useEffect(() => {
        const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }
            let allLinks = document.querySelectorAll('ul.horizontal-menu a.active');
            for (let i = 0; i < allLinks.length; i++) {
                const element = allLinks[i];
                element?.classList.remove('active');
            }
            selector?.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }, [router.pathname]);

    const signOutHandle = async () => {
        setOverlayVisible(true);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('login-time');
        setTimeout(() => {
            signOut({ callbackUrl: '/login' });
        }, 1000)
    };

    const [notifications, setNotifications] = useState([
        {
            id: 1,
            profile: 'user-profile.jpeg',
            message: '<strong class="text-sm mr-1">John Doe</strong>invite you to <strong>Prototyping</strong>',
            time: '45 min ago',
        },
        {
            id: 2,
            profile: 'profile-34.jpeg',
            message: '<strong class="text-sm mr-1">Adam Nolan</strong>mentioned you to <strong>UX Basics</strong>',
            time: '9h Ago',
        },
        {
            id: 3,
            profile: 'profile-16.jpeg',
            message: '<strong class="text-sm mr-1">Anna Morgan</strong>Upload a file',
            time: '9h Ago',
        },
    ]);

    const removeNotification = (value: number) => {
        setNotifications(notifications.filter((user) => user.id !== value));
    };

    const { t } = useTranslation();

    return (
        <div>
            {isOverlayVisible && <Overlay />}
            <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
                <div className="shadow-sm">
                    <div className="fixed w-full bg-white border items-center p-5 flex justify-between">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <picture>
                                <img className="inline w-8 ltr:-ml-1 rtl:-mr-1" src="/assets/images/venture_logo_2.png" alt="logo" />
                            </picture>
                            <span className="hidden align-middle text-2xl  font-semibold  transition-all duration-300 ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light md:inline">{t('venture')}</span>
                        </Link>
                        <h5 className='text-xl font-semibold'>{active == "calendar" ? 'Scheduler' : active == 'booking' ? 'Booked Tours' : active == 'profile' ? 'Profile' : router.pathname == '/' ? 'Scheduler' : router.pathname == '/booking' ? 'Booked Tours' : (router.pathname == '/profile' || router.pathname == '/profile-edit') ? 'Profile' : null}</h5>
                        <div className='w-8' onClick={() => signOutHandle()}>
                            <IconLogout className='h-6 w-6 text-[#e94c4c]' />
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default Header;
