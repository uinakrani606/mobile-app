import GuideCalendar from "@/components/GuideCalendar";
import { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle, toggleOpenHelp } from '../store/themeConfigSlice';
import { IRootState } from '@/store';
import axios from 'axios';
import moment from 'moment';

const Calendar = () => {

    const dispatch = useDispatch();
    const user = useSelector((state: IRootState) => state.themeConfig.userLogin);
    const token = useSelector((state: IRootState) => state.themeConfig.userAuth);
    const [events, setEvents] = useState([]);
    const [today, setToday] = useState<Date | null>(null);

    useEffect(() => {
        dispatch(setPageTitle('Scheduler'));
    });
    const [localTime, setLocalTime] = useState('');
    const [selectedGuideCity, setSelectedGuideCity] = useState<any>();

    useEffect(() => {
        dispatch(setPageTitle('Scheduler'));
    });

    useEffect(() => {
        if (localTime) {
            const todayString = moment(localTime, 'h:mmA YYYY-MM-DD').format('MM-DD-YYYY');
            const todayDate = new Date(todayString);
            setToday(todayDate);
        }
    }, [localTime]);

    async function getTimeInTimezone(timezone: string) {
        const response = await fetch(`https://timeapi.io/api/timezone/zone?timeZone=${timezone}`);
        const data = await response.json();
        return data;
    }

    useEffect(() => {
        if (user.city) {
            fetchCities();
        }
    }, [user.city])

    useEffect(() => {
        if (selectedGuideCity) {
            getTimeInTimezone(selectedGuideCity.timezone).then(data => {
                const date = moment(data.currentLocalTime);
                setLocalTime(date.format('h:mmA YYYY-MM-DD'))
            }).catch(error => {
                console.error('Error fetching time:', error);
            });
        }
    }, [selectedGuideCity])

    const fetchCities = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/city`);
            const city = response.data.find((city: any) => (city.city == user.city));
            setSelectedGuideCity(city);
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

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
            setEvents(transformedEvents);
        } catch (error: any) {
            console.error(error);
        }
    };

    const showMessage = (msg = '', type = 'info') => {
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
        <div className="">
            <GuideCalendar eventHandle={eventHandle} events={events} showMessage={showMessage} token={token} localTime={localTime} today={today} selectedGuideCity={selectedGuideCity} user={user} />
        </div>
    );
};

export default Calendar;
