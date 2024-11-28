
import { DataTable } from "mantine-datatable";
import { useState, useEffect } from 'react';
import moment from "moment";
import axios from "axios";
import { useSelector } from "react-redux";
import { IRootState } from "@/store";

const Booking = () => {
    const user = useSelector((state: IRootState) => state.themeConfig.userLogin);
    const token = useSelector((state: IRootState) => state.themeConfig.userAuth);
    const [bookingSchedule, setBookingSchedule] = useState<any[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<any>(bookingSchedule);
    const [shortNames, setShortNames] = useState([]);

    useEffect(() => {
        eventHandle();
    }, [user])

    const eventHandle = async () => {
        if (!user.user_id) return;
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/schedules?user_id=${user.user_id}`,
                {
                    headers: { Authorization: `bearer ${token}` }
                }
            );
            const transformedEvents = response.data.map((event: any) => {
                let className = '';
                let title = '';
                let slot = event.type;
                switch (event.status) {
                    case 'available':
                        className = '';
                        title = 'Available';
                        break;
                    case 'unavailable':
                        className = '';
                        title = 'Unavailable';
                        break;
                    case 'booked':
                        className = 'info';
                        title = 'Booked';
                        break;
                }
                event.start_date = `${event.start_date.split('T')[0]}T${event.start_time.split('+')[0]}`;
                event.end_date = `${event.end_date.split('T')[0]}T${event.end_time.split('+')[0]}`;
                return {
                    id: event.id,
                    title: title,
                    start: event.start_date,
                    end: event.end_date,
                    status: event.status,
                    custom_tours: event.custom_tours || [],
                    className: className,
                    city: event.city,
                    slot: slot,
                    am: event.am,
                    pm: event.pm,
                    custom_time: typeof event.custom_times === 'string'
                        ? JSON.parse(event.custom_times)
                        : event.custom_times,
                    custom: event.custom,
                    am_booked: event.am_booked,
                    pm_booked: event.pm_booked,
                    am_tours: event.am_tours || [],
                    pm_tours: event.pm_tours || []
                };
            });
            const bookingSchedules = transformedEvents.filter((item: any) =>
                item.am_booked != null || item.pm_booked != null
            );
            setBookingSchedule(bookingSchedules);
        } catch (error: any) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (bookingSchedule) {
            const filtered = bookingSchedule
                .filter((item: any) => {
                    const startDate = new Date(item.start);
                    return startDate > new Date();
                })
                .sort((a: any, b: any) => {
                    return moment(a.start).diff(moment(b.start));
                });
            setFilteredTasks(filtered);
        }
    }, [bookingSchedule]);

    const fatchTour = async () => {
        try {
            const toursResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tours`, {
                headers: { 'Authorization': `bearer ${token}` }
            });
            const tourShortNames = toursResponse.data.reduce((map: any, tour: any) => {
                map[tour.tour_name] = tour.short_name;
                return map;
            }, {});
            setShortNames(tourShortNames);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fatchTour();
    }, [token]);

    return (
        <div className="relative h-full">
            <div>
                {filteredTasks.length == 0 && <div className="text-gray-500 text-center">
                    No events available for Booking Schedule.
                </div>}
                {filteredTasks.map((row: any) => (
                    <div className={`flex flex-col bg-[#f8fafc] py-[15px] px-4 rounded-md  mb-3 border-l-8 border-primary`} key={row.id}>
                        <div className="flex justify-between ">
                            <div className="flex-1">
                                {row.am_booked && <div>
                                    <div className={`whitespace-pre-wrap break-words leading-[16px] text-[#31394f] text-sm font-bold`}>
                                        {shortNames[row.am_booked[0].tour_name]}
                                    </div>
                                    <div className={`overflow-hidden text-[#31394f99] text-xs pt-1 truncate`}>
                                        Group : {row.am_booked[0].group}
                                    </div></div>}
                                {(row.pm_booked && row.am_booked) && <br></br>}
                                {row.pm_booked && <div>
                                    <div className={`whitespace-pre-wrap break-words leading-[16px] text-[#31394f] text-sm font-bold`}>
                                        {shortNames[row.pm_booked[0].tour_name]}
                                    </div>
                                    <div className={`overflow-hidden text-[#31394f99] text-xs pt-1 truncate `}>
                                        Group : {row.pm_booked[0].group}
                                    </div></div>}
                            </div>
                            <div className="w-24">
                                <p className={`whitespace-nowrap font-medium text-black text-right text-xs`}>
                                    {moment(row.start).format('YYYY-MM-DD')} {(row.am_booked && row.pm_booked ? '' : !row.am_booked ? '(PM)' : !row.pm_booked && '(AM)')}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Booking;