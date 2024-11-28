import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../store';
import { setPageTitle } from '../store/themeConfigSlice';
import { useEffect, useState } from 'react';
import IconPencilPaper from '@/components/Icon/IconPencilPaper';
import IconMapPin from '@/components/Icon/IconMapPin';
import IconMail from '@/components/Icon/IconMail';
import IconPhone from '@/components/Icon/IconPhone';
import IconTwitter from '@/components/Icon/IconTwitter';
import IconDribbble from '@/components/Icon/IconDribbble';
import IconGithub from '@/components/Icon/IconGithub';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

const Profile = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const userData = useSelector((state: IRootState) => state.themeConfig.userLogin);
    const user = useSelector((state: IRootState) => state.themeConfig.userLogin.user_id);
    const [userTours, setUserTours] = useState(userData.tours && userData.tours.length ? [...userData.tours] : []);
    const [userLanguages, setUserLanguages] = useState(userData.languages && userData.languages.length ? [...userData.languages] : []);
    const [profilePic, setProfilePic] = useState("/assets/images/profile.png");
    const { t } = useTranslation();

    useEffect(() => {
        if (userData.profile_pic != "" || userData.profile_pic != null) {
            setProfilePic(userData.profile_pic);
        }
        setUserTours(userData.tours?.length ? [...userData.tours] : []);
        setUserLanguages(userData.languages?.length ? [...userData.languages] : []);
        dispatch(setPageTitle('Profile'));
    }, [userData, user, dispatch, router])

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                        {t('users')}
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('profile')}</span>
                </li>
            </ul>
            <div className="pt-5">
                <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="panel">
                        <div className="mb-5 flex items-center justify-between">
                            <h5 className="text-lg font-semibold dark:text-white-light">{t('profile')}</h5>
                            <Link href="/profile-edit" className="btn btn-primary rounded-full p-2 ltr:ml-auto rtl:mr-auto">
                                <IconPencilPaper />
                            </Link>
                        </div>
                        <div className="mb-5">
                            <div className="flex flex-col items-center justify-center">
                                <picture>
                                    <img src={profilePic ? profilePic : '../assets/images/profile.png'} alt="img" className="mb-5 h-24 w-24 rounded-full object-cover" />
                                </picture>
                                <p className="text-xl font-semibold text-primary capitalize">{userData.first_name} {userData.last_name}</p>
                            </div>
                            <ul className="m-auto mt-5 flex max-w-[160px] flex-col space-y-4 font-semibold text-white-dark">
                                <li className="flex items-center gap-2">
                                    <IconMapPin className="shrink-0" />
                                    {userData.city}
                                </li>
                                <li>
                                    <button className="flex items-center gap-2">
                                        <IconMail className="w-5 h-5 shrink-0" />
                                        <span className="truncate text-primary">{userData.email}</span>
                                    </button>
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconPhone />
                                    <span className="whitespace-nowrap" dir="ltr">
                                        {userData.telephone}
                                    </span>
                                </li>
                            </ul>
                            <ul className="mt-7 flex items-center justify-center gap-2">
                                <li>
                                    <button className="btn btn-info flex h-10 w-10 items-center justify-center rounded-full p-0">
                                        <IconTwitter className="w-5 h-5" />
                                    </button>
                                </li>
                                <li>
                                    <button className="btn btn-danger flex h-10 w-10 items-center justify-center rounded-full p-0">
                                        <IconDribbble />
                                    </button>
                                </li>
                                <li>
                                    <button className="btn btn-dark flex h-10 w-10 items-center justify-center rounded-full p-0">
                                        <IconGithub />
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="panel lg:col-span-2 xl:col-span-3">
                        <div className="panel">
                            <div className="mb-5 flex items-center justify-between">
                                <h5 className="text-lg font-semibold dark:text-white-light">{t('tours')}</h5>
                            </div>
                            <div>
                                {userTours?.map((tour: string, index: number) => (
                                    <div key={index} className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                                        <div className="flex items-center justify-between py-2">
                                            <h6 className="font-semibold text-[#515365] dark:text-white-dark">
                                                {tour}
                                            </h6>
                                        </div>
                                    </div>
                                ))}
                                {!userTours?.length && (
                                    <div>
                                        {t('No_tours_selected')}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="panel mt-5">
                            <div className="mb-5 flex items-center justify-between">
                                <h5 className="text-lg font-semibold dark:text-white-light">{t('languages')}</h5>
                            </div>
                            <div>
                                {userLanguages?.map((language: string, index: number) => (
                                    <div key={index} className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                                        <div className="flex items-center justify-between py-2">
                                            <h6 className="font-semibold text-[#515365] dark:text-white-dark">
                                                {language}
                                            </h6>
                                        </div>
                                    </div>
                                ))}
                                {!userLanguages?.length && (
                                    <div>
                                        {t('No_language_selected')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
