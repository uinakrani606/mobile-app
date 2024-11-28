import Link from "next/link"
import IconPlus from "../Icon/IconPlus"
import { useDispatch, useSelector } from "react-redux"
import { toggleAddEditEvent, toggleAddEvent, toggleNavigationView, toggleOpenHelp } from "@/store/themeConfigSlice"
import NavigationCalendar from "../Icon/NavigationCalendar"
import NavigationUser from "../Icon/NavigationUser"
import NavigationBooking from "../Icon/NavigationBooking"
import NavigationChatNotification from "../Icon/NavigationChatNotification"
import { IRootState } from "@/store"
import { useEffect, useState } from "react"
import IconX from "../Icon/IconX"
import Swal from "sweetalert2"
import axios from "axios"
import AddEditModel from "../AddEditModel";

const Navigation = ({ router }: any) => {
    const active = useSelector((state: IRootState) => state.themeConfig.NavigationView);
    const openHelp = useSelector((state: IRootState) => state.themeConfig.openHelp);
    const user = useSelector((state: IRootState) => state.themeConfig.userLogin);
    const token = useSelector((state: IRootState) => state.themeConfig.userAuth);
    const dispatch = useDispatch();
    const defaultHelpParams = {
        name: '',
        description: '',
        priority: '',
        notes: '',
        status: ''
    };
    const [helpParams, setHelpParams] = useState<any>(JSON.parse(JSON.stringify(defaultHelpParams)));

    useEffect(() => {
        if (active == 'help') {
            dispatch(toggleOpenHelp());
        }
    }, [active])

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setHelpParams({ ...helpParams, [id]: value });
    };

    const showMessage = (msg: string = '', type = 'info') => {
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

    const sendHelp = async (e: any) => {
        e.preventDefault();
        if (!helpParams.name) {
            showMessage('Title Required', 'error');
            return false;
        }
        if (!helpParams.description) {
            showMessage('Description Required', 'error');
            return false;
        }
        if (!helpParams.priority) {
            showMessage('Priority Required', 'error');
            return false;
        }
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/manager_tasks`, {
                ...helpParams,
                sender_id: user.user_id,
                status: '',
                notes: ''
            }, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            dispatch(toggleOpenHelp());
            showMessage('Message Sent', 'success');
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    useEffect(() => {
        if (!openHelp) {
            if (router.pathname == '/') {
                dispatch(toggleNavigationView('calendar'));
            }
            if (router.pathname == '/booking') {
                dispatch(toggleNavigationView('booking'));
            }
            if (router.pathname == '/profile' || router.pathname == '/profile-edit') {
                dispatch(toggleNavigationView('profile'));
            }
        }
    }, [openHelp])

    return (
        <div>
            <div className="px-3 py-5 rounded-t-3xl navigation mt-auto fixed bottom-0 bg-white w-full text-center dark:text-white-dark ltr:sm:text-left rtl:sm:text-right">
                <div className="">
                    <ul className="flex justify-between text-center" key={active}>
                        <li className="active w-[20%]">
                            <Link href="/" onClick={() => dispatch(toggleNavigationView('calendar'))} className="flex flex-col justify-center items-center text-center">
                                <NavigationCalendar className={`${active == 'calendar' ? 'text-primary' : 'text-[#58595be6]'} h-[25px] w-[25px]`} />
                                <span className={`${active == 'calendar' ? 'text-primary' : 'text-[#58595be6]'} pt-1 text-xs`}>Calendar</span>
                            </Link>
                        </li>
                        <li className="w-[20%] self-end">
                            <Link href="/booking" onClick={() => dispatch(toggleNavigationView('booking'))} className="flex flex-col justify-center items-center">
                                <NavigationBooking className={`${active == 'booking' ? 'text-primary' : 'text-[#58595be6]'} h-[23px] w-6`} />
                                <span className={`${active == 'booking' ? 'text-primary' : 'text-[#58595be6]'} pt-1 text-xs`}>Bookings</span>
                            </Link>
                        </li>
                        {router.pathname == '/' ? <li className="mt-[-49px] mx-[-20px] w-[17%]">
                            <div onClick={() => dispatch(toggleNavigationView('NewEvent'))} className="flex items-center justify-center rounded-full w-16 h-16 bg-primary">
                                <IconPlus className="text-white text-2xl w-9 h-9" />
                            </div>
                        </li> : <li className="mt-[-49px] mx-[-20px] w-[17%]">
                            <div onClick={() => dispatch(toggleNavigationView('OtherEvent'))} className="flex items-center justify-center rounded-full w-16 h-16 bg-primary">
                                <IconPlus className="text-white text-2xl w-9 h-9" />
                            </div>
                        </li>}
                        <li className="w-[20%]">
                            <div onClick={() => dispatch(toggleNavigationView('help'))} className="flex flex-col justify-center items-center">
                                <NavigationChatNotification className={`${active == 'help' ? 'text-primary' : 'text-[#58595be6]'} h-[25px] w-[25px]`} />
                                <span className={`${active == 'help' ? 'text-primary' : 'text-[#58595be6]'} pt-1 text-xs`}>Help</span>
                            </div>
                        </li>
                        <li className="w-[20%]">
                            <Link href="/profile" onClick={() => dispatch(toggleNavigationView('profile'))} className="flex flex-col justify-center items-center">
                                <NavigationUser className={`${active == 'profile' ? 'text-primary' : 'text-[#58595be6]'} h-[25px] w-[25px]`} />
                                <span className={`${active == 'profile' ? 'text-primary' : 'text-[#58595be6]'} pt-1 text-xs`}>Profile</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className={`fixed inset-0 z-50 flex items-end bg-black bg-opacity-50 ${openHelp ? "translate-y-0" : "translate-y-full"}`} onClick={() => {
                dispatch(toggleOpenHelp());
            }}>
                <div
                    className={`offcanvas offcanvas-bottom bg-white w-full rounded-t-xl shadow-lg transform transition duration-500 ${openHelp ? "translate-y-0" : "translate-y-full"
                        }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex relative">
                        <button
                            type="button"
                            onClick={() => {
                                dispatch(toggleOpenHelp());
                            }}
                            className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                        >
                            <IconX />
                        </button>
                        <div className="bg-[#fbfbfb] py-3 rounded-t-lg text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                            Message a Manager
                        </div>
                    </div>
                    <div className="max-h-[480px] overflow-y-auto p-5">
                        <form onSubmit={sendHelp}>
                            <div className="grid gap-5">
                                <div>
                                    <label htmlFor="name">Subject</label>
                                    <input
                                        id="name"
                                        value={helpParams.name}
                                        onChange={(e) => changeValue(e)}
                                        type="text"
                                        className="form-input mt-1"
                                        placeholder="Enter Subject"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="priority">Priority</label>
                                    <select
                                        id="priority"
                                        className="form-select"
                                        value={helpParams.priority}
                                        onChange={(e) => changeValue(e)}
                                    >
                                        <option value="">Select Priority</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        placeholder="Enter Description"
                                        className="form-input"
                                        rows={4}
                                        value={helpParams.description}
                                        onChange={(e) => changeValue(e)}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="mt-8 flex items-center justify-end">
                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                    Send
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <AddEditModel user={user} showMessage={showMessage} dispatch={dispatch} token={token} active={active} router={router} />
        </div>
    )
}

export default Navigation;
