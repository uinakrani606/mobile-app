import Link from 'next/link';
import { useEffect, useState } from 'react';
import { setPageTitle, toggleUser } from '../store/themeConfigSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { IRootState } from '@/store';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';
import IconEdit from '@/components/Icon/IconEdit';
import MaskedInput from 'react-text-mask';

const AccountSetting = () => {
    const dispatch = useDispatch();
    const userData = useSelector((state: IRootState) => state.themeConfig.userLogin);
    const [profilePic, setProfilePic] = useState("/assets/images/profile.png");
    const user = userData.user_id;
    const router = useRouter();
    const token = useSelector((state: IRootState) => state.themeConfig.userAuth);
    const [firstName, setFirstName] = useState(userData.first_name);
    const [lastName, setLastName] = useState(userData.last_name);
    const [email, setEmail] = useState(userData.email);
    const [phone, setPhone] = useState(userData.telephone);
    const [languages, setLanguages] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState<any[]>([]);
    const [selectedLanguagesString, setSelectedLanguagesString] = useState<any[]>([]);
    interface City {
        id: number;
        city: string;
    }
    const [city, setCity] = useState<City[]>([]);
    const [location, setLocation] = useState(userData.city);
    const [tours, setTours] = useState<Tours[]>([]);
    const [selectedTours, setSelectedTours] = useState<any>();
    const [selectGuide, setSelectGuide] = useState<any>();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [paramPassword, setParamPassword] = useState({
        password: '',
        c_password: ''
    });
    const [updatePassword, setUpdatePassword] = useState(false);

    useEffect(() => {
        setSelectedLanguages(userData.languages && userData.languages.length ? [...userData.languages] : []);
        setSelectGuide(userData.tours)
        setLocation(userData.city);
        setFirstName(userData.first_name);
        setLastName(userData.last_name);
        setEmail(userData.email);
        setPhone(userData.telephone);
        setSelectedTours(userData.tours && userData.tours.length ? [...userData.tours] : [])
    }, [userData]);

    useEffect(() => {
        dispatch(setPageTitle('Profile'));
    }, [dispatch]);

    useEffect(() => {
        if (selectedTours) {
            setSelectGuide(selectedTours);
        }
    }, [selectedTours]);

    const handleTourChange = (tourName: any) => {
        let updatedTours;
        if (selectedTours.includes(tourName as never)) {
            updatedTours = selectedTours.filter((name: any) => name !== tourName);
        } else {
            updatedTours = [...selectedTours, tourName];
        }
        setSelectedTours(updatedTours as never);
        setSelectGuide(updatedTours);
    };

    const handleSelectAll = () => {
        let updatedTours: any;
        if (tours.length == selectedTours.length) {
            updatedTours = [];
        } else {
            updatedTours = tours.map(tour => tour.tour_name);
        }

        setSelectedTours(updatedTours as never);
        setSelectGuide(updatedTours);
    };


    const handleCheckboxChange = (event: any) => {
        const language = event.target?.value;
        setSelectedLanguages((prevSelectedLanguages: any) => {
            if (prevSelectedLanguages.includes(language)) {
                return prevSelectedLanguages.filter((lang: string) => lang !== language);
            } else {
                return [...prevSelectedLanguages, language];
            }
        });
    };

    useEffect(() => {
        setSelectedLanguagesString(selectedLanguages);
    }, [selectedLanguages]);

    useEffect(() => {
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/city`, {
                headers: { 'Authorization': `bearer ${token}` }
            })
            .then(function (response) {
                setCity(response.data);
            })
            .catch(function (error) {
                console.error(error.response);
            });
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/languages`, {
                headers: { 'Authorization': `bearer ${token}` }
            })
            .then(function (response) {
                setLanguages(response.data);
            })
            .catch(function (error) {
                console.error(error.response);
            });
    }, [token]);

    useEffect(() => {
        if (userData && userData.profile_pic != '' || userData.profile_pic != null) {
            setProfilePic(userData.profile_pic);
        }
    }, [userData]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const file = event.target.files[0];
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                showMessage(t('File_type_not_allowed'), 'error');
                return;
            }
            const maxSizeInMB = 2;
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
            if (file.size > maxSizeInBytes) {
                showMessage(t('file_size_exceed', { size: maxSizeInMB }));
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setProfilePic(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const profileUpdate = async () => {
        const updatedAt = new Date().toISOString();
        if (lastName == '') {
            showMessage(t('Enter_Last_Name'), 'error');
        } else if (firstName == '') {
            showMessage(t('Enter_First_Name'), 'error');
        } else if (email == '') {
            showMessage(t('Enter_your_email'), 'error');
        } else if (phone == '') {
            showMessage(t('Enter_Telephone_Number'), 'error');
        } else if (location == '') {
            showMessage(t('Select_your_City'), 'error');
        } else if (!selectedTours.length) {
            showMessage(t('Atleast_one_tour_should_be_selected'), "error");
        } else if (!selectedLanguages.length) {
            showMessage(t('Atlease_one_language_should_be_selected'), "error");
        } else {
            if (selectedFile) {
                try {
                    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/upload`, {
                        user_id: userData.user_id,
                        file: selectedFile
                    }, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `bearer ${token}`
                        }
                    });
                } catch (error) {
                    console.error('Error uploading file', error);
                }
            }
            const profile = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${userData.user_id}`, {
                headers: { 'Authorization': `bearer ${token}` }
            })
            setProfilePic(profile.data.profile_pic);
            await axios
                .put(
                    `${process.env.NEXT_PUBLIC_API_URL}/users/${user}`,
                    {
                        first_name: firstName,
                        last_name: lastName,
                        email: email,
                        active: true,
                        profile_pic: profile.data.profile_pic,
                        telephone: phone,
                        updated_at: updatedAt,
                        city: location,
                        tours: selectGuide,
                        languages: selectedLanguagesString,
                        password: userData.password,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `bearer ${token}`
                        },
                    }
                )
                .then(function (response) {
                    dispatch(
                        toggleUser({
                            first_name: firstName,
                            last_name: lastName,
                            email: email,
                            active: true,
                            profile_pic: profile.data.profile_pic,
                            telephone: phone,
                            city: location,
                            tours: selectGuide,
                            languages: selectedLanguagesString,
                            user_id: response.data.user_id,
                            password: userData.password,
                            role: userData.role
                        })
                    );
                    router.push('/profile');
                    showMessage(t('Saved'), 'success');
                })
                .catch(function (error) {
                    console.error(error);
                });
        }
    };

    const savePassword = () => {
        if (!paramPassword.password) {
            showMessage(t('password_required'), 'error');
            return false;
        }
        if (!paramPassword.c_password) {
            showMessage(t('Confirm Password Required'), 'error');
            return false;
        }
        if (paramPassword.c_password !== paramPassword.password) {
            showMessage(t('Password and Confirm Password must be Same.'), 'error');
            return false;
        }
        axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/password/${user}?password=${paramPassword.c_password}`, { password: paramPassword.c_password, user_id: user },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `bearer ${token}`
                },
            }
        )
            .then(function (response) {
                showMessage(t('Your Password Successfully Changed.'), 'success');
                setUpdatePassword(false);
                dispatch(
                    toggleUser({
                        ...userData,
                        password: paramPassword.c_password
                    })
                );
                setParamPassword({ password: '', c_password: '' })
            })
            .catch(function (error) {
                console.error(error);
            });
    }

    const passwordChange = (e: any) => {
        const { value, id } = e.target;
        setParamPassword({ ...paramPassword, [id]: value });
    }

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

    useEffect(() => {
        dispatch(setPageTitle('Account Setting'));
    });

    interface Tours {
        id: number;
        tour_name: string;
        country: string;
        city: string;
    }

    const fetchTours = (location: string) => {
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/tours/city/${location}`, {
                headers: { Authorization: `bearer ${token}` }
            })
            .then(function (response) {
                setTours(response.data);
            })
            .catch(function (error) {
                console.error(error.response);
            });
    };

    useEffect(() => {
        if (location) {
            fetchTours(location);
        }
    }, [location, token])

    const { t } = useTranslation();

    return (
        <div>
            <div className="flex items-center justify-between">
                <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="#" className="text-primary hover:underline">
                            {t('users')}
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>{t('account_settings')}</span>
                    </li>
                </ul>
                <div className="flex justify-center sm:col-span-3 md:ms-auto md:justify-end">
                    <button type="button" className="btn btn-primary sm:px-10 px-8" onClick={profileUpdate}>
                        {t('save')}
                    </button>
                </div>
            </div>
            <div className="pt-5">
                <div>
                    <div>
                        <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3 xl:grid-cols-4">
                            <div className="panel w-full">
                                <h6 className="mb-5 text-lg font-bold">{t('user_info')}</h6>
                                <div>
                                    <div className="relative mx-auto mb-5 h-24 w-24 rounded-full md:h-32 md:w-32">
                                        <picture>
                                            <img src={profilePic ? profilePic : '../assets/images/profile.png'} alt="img" className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover" />
                                        </picture>
                                        <div
                                            className="border-gray absolute -right-2.5 -top-2.5 cursor-pointer rounded-full border-2 bg-white p-2 md:right-0 md:top-0"
                                            onClick={() => {
                                                const fileInput = document.getElementById('fileInput');
                                                if (fileInput) {
                                                    (fileInput as HTMLInputElement).click();
                                                }
                                            }}>
                                            <IconEdit />
                                            <input type="file" id="fileInput" style={{ display: 'none' }} onChange={handleFileChange} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className='flex sm:gap-5 gap-3 mb-5'>
                                            <div className="w-full">
                                                <label htmlFor="name">{t('first_name')} *</label>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    placeholder="Enter First Name"
                                                    className="form-input"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                />
                                            </div>
                                            <div className="w-full">
                                                <label htmlFor="name">{t('last_name')} *</label>
                                                <input id="name" type="text" placeholder="Enter Last Name" className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="city">{t('city')} *</label>
                                            <select id="city" className="form-select text-[#0e1726]" disabled name="city" defaultValue={location}>
                                                <option value=''>Select Your City</option>
                                                {city &&
                                                    city.map((cities) => (
                                                        <option value={cities.city} selected={userData.city == cities.city} key={cities.id}>
                                                            {cities.city}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="email">{t('email')} *</label>
                                            <input id="email" type="email" placeholder="Enter Email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                                        </div>
                                        <div>
                                            <label htmlFor="phone">{t('phone')} *</label>
                                            <MaskedInput
                                                id="phone"
                                                type="text"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="Enter Phone Number"
                                                className="form-input"
                                                mask={[/[0-9]/, /[0-9]/, /[0-9]/, ' ', /[0-9]/, /[0-9]/, /[0-9]/, ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button type="button" className="btn btn-primary mt-5" onClick={() => setUpdatePassword(true)}>
                                    Update Password
                                </button>
                            </div>
                            {updatePassword ?
                                <div className='border border-gray-100 rounded-lg shadow-md p-5 panel lg:col-span-2 xl:col-span-3'>
                                    <div className="flex justify-between">
                                        <h3 className="text-lg font-semibold">Update Password</h3>
                                    </div>
                                    <div className='pt-3'>
                                        <label htmlFor="password">New Password <span className='text-danger'>*</span></label>
                                        <input id="password" value={paramPassword.password} onChange={passwordChange} type="password" className="form-input" placeholder="Enter New Password" />
                                    </div>
                                    <div className='pt-3'>
                                        <label htmlFor="c_password">Confirm Password <span className='text-danger'>*</span></label>
                                        <input id="c_password" value={paramPassword.c_password} onChange={passwordChange} type="password" className="form-input" placeholder="Enter Confirm  Password" />
                                    </div>
                                    <div className='pt-6'>
                                        <button type="button" className="btn btn-primary" onClick={() => savePassword()}>
                                            Save New Password
                                        </button>
                                    </div>
                                </div> : <div className="panel flex lg:col-span-2 xl:col-span-3">
                                    <div className="grid gap-5 sm:grid-cols-1 w-full">
                                        <form className="panel">
                                            <div className='flex items-center justify-between mb-5 gap-5 '>
                                                <h6 className="text-lg font-bold">{t('tours')}</h6>
                                                <span className='btn btn-primary btn-sm cursor-pointer inline-block' onClick={() => handleSelectAll()}>
                                                    {tours.length == selectedTours?.length ? 'Deselect All' : ' Select All'}
                                                </span>
                                            </div>
                                            <div>
                                                <div>
                                                    {tours &&
                                                        tours.map((item) => (
                                                            <div className="mb-5 last:mb-0" key={item.id}>
                                                                <label className="inline-flex cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-checkbox outline-primary"
                                                                        checked={selectedTours.includes(item.tour_name)}
                                                                        onChange={() => handleTourChange(item.tour_name)}
                                                                    />
                                                                    <span className="checked:bg -none relative text-white-dark">
                                                                        {item.tour_name}
                                                                    </span>
                                                                </label>
                                                            </div>
                                                        ))}
                                                    {!tours.length && <label>{t('No_tours_available_for_this_city')}</label>}
                                                </div>
                                            </div>
                                        </form>
                                        <div className="panel">
                                            <label htmlFor="city">{t('languages')} *</label>
                                            <div className="mt-4 grid w-fit grid-cols-2 sm:gap-x-6 gap-x-4   gap-y-3">
                                                {languages.map((lang: { language: string; id: number }) => (
                                                    <div key={lang.id}>
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                className="form-checkbox outline-primary"
                                                                value={lang.language}
                                                                onChange={handleCheckboxChange}
                                                                checked={selectedLanguages.includes(lang.language as never)}
                                                            />
                                                            {lang.language}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSetting;
