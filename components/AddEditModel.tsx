import { toggleAddEvent, toggleNavigationView } from "@/store/themeConfigSlice";
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import IconX from "./Icon/IconX";
import moment from "moment";
import { useTranslation } from "react-i18next";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import IconTrashLines from "./Icon/IconTrashLines";
import IconPlus from "./Icon/IconPlus";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IRootState } from "@/store";

type SlotType = 'am' | 'pm' | 'custom';

interface TimePicker {
    start: string;
    end: string;
    status: any;
}

type TimeType = 'startTime' | 'endTime';

const AddEditModel = ({ user, showMessage, dispatch, token, active, router }: any) => {
    const [localTime, setLocalTime] = useState('');
    const [customSlot, setCustomSlot] = useState(false);
    const defaultParams = {
        id: '',
        title: '',
        start: '',
        end: '',
        custom_tours: '',
        slot: 'am',
        type: 'available',
        status: 'available',
        am: null,
        pm: null,
        custom: null,
        am_tours: '',
        pm_tours: '',
        custom_time: [{ start: '09:00', end: '09:00', status: 'unavailable' }] as TimePicker[]
    };
    const [params, setParams] = useState<any>(defaultParams);
    const [selectedGuideCity, setSelectedGuideCity] = useState<any>();
    const { t } = useTranslation();
    const [activeTour, setActiveTour] = useState<any>({
        am: null,
        pm: null,
        custom: null
    })
    const [disabledDate, setDisabledDate] = useState<any>([]);
    const [shortNames, setShortNames] = useState([]);
    const [tours, setTours] = useState<any[]>([]);
    const [Toursavailable, setToursavailable] = useState({
        am: [],
        pm: [],
        custom: []
    });
    const [slot, setSlot] = useState('');
    const [events, setEvents] = useState([]);
    let newParams = { ...params };
    let newToursAvailable = { ...Toursavailable };
    const isOpenAdd = useSelector((state: IRootState) => state.themeConfig.addEvent);
    const [customButton, setCustomButton] = useState(true);

    useEffect(() => {
        if (user.city) {
            fetchCities();
        }
    }, [user.city])

    const fetchCities = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/city`);
            const city = response.data.find((city: any) => (city.city == user.city));
            setSelectedGuideCity(city);
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    useEffect(() => {
        if (slot != '') {
            TimingTours(slot);
            if (slot === 'am') {
                TimingTours('pm');
            }
            else if (slot === 'pm') {
                TimingTours('am');
            }
        }
    }, [params.am, params.pm, params.custom, slot])

    const disablePastDates = (date: any) => {
        const todayDate: any = new Date(moment(localTime, 'h:mmA YYYY-MM-DD').format('MMMM D, YYYY'));
        todayDate.setHours(0, 0, 0, 0);
        return date < todayDate;
    };

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

    async function getTimeInTimezone(timezone: string) {
        const response = await fetch(`https://timeapi.io/api/timezone/zone?timeZone=${timezone}`);
        const data = await response.json();
        return data;
    }

    const handleCustomStatus = (index: number) => {
        setParams((prevParams: any) => {
            const updatedCustomTime = [...prevParams.custom_time];
            const currentStatus = updatedCustomTime[index].status;
            updatedCustomTime[index].status = currentStatus === 'available' ? 'unavailable' : 'available';
            return {
                ...prevParams,
                custom_time: updatedCustomTime
            };
        });
    }

    const setHoursAndMinutes = (date: Date, hours: number, minutes: number): Date => {
        date?.setHours(hours, minutes, 0, 0);
        return date;
    };

    const minTime = setHoursAndMinutes(new Date(), 9, 0);
    const maxTime = setHoursAndMinutes(new Date(), 20, 0);

    const getPickerTime = (time: any) => {
        if (typeof time === 'string') {
            const [hours, minutes] = time.split(':').map(Number);
            const date = new Date();
            date?.setHours(hours, minutes, 0, 0);
            return date;
        }
        return time instanceof Date && !isNaN(time.getTime()) ? time : setHoursAndMinutes(new Date(), 9, 0);
    };

    const CustomTimeDelete = (index: number) => {
        const newCustomTime = [...params.custom_time.slice(0, index), ...params.custom_time.slice(index + 1)];
        setParams((prevParams: any) => ({
            ...prevParams,
            custom_time: newCustomTime
        }));
    };

    useEffect(() => {
        if (active == "OtherEvent") {
            editEvent();
        }
    }, [active])

    const dateFormat = (dt: any) => {
        dt = new Date(dt);
        const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
        const date = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
        dt = dt.getFullYear() + '-' + month + '-' + date;
        return dt;
    };

    const getDisabledTimes = (currentIndex: number): Date[] => {
        const disabledTimes: string[] = [];
        const isWithinWorkingHours = (time: string): boolean => {
            const [hours] = time.split(':').map(Number);
            return hours >= 9 && hours <= 20;
        };
        const isTimeBetween = (time: string, start: string, end: string): boolean => {
            const [hours, minutes] = time.split(':').map(Number);
            const [startHours, startMinutes] = start.split(':').map(Number);
            const [endHours, endMinutes] = end.split(':').map(Number);
            const currentTime = new Date();
            currentTime.setHours(hours, minutes, 0, 0);
            const startTime = new Date();
            startTime.setHours(startHours, startMinutes, 0, 0);
            const endTime = new Date();
            endTime.setHours(endHours, endMinutes, 0, 0);
            return currentTime >= startTime && currentTime <= endTime;
        };
        params.custom_time?.forEach((picker: any, index: number) => {
            if (index !== currentIndex && picker.start && picker.end) {
                let current = picker.start;
                while (isTimeBetween(current, picker.start, picker.end)) {
                    if (isWithinWorkingHours(current)) {
                        disabledTimes.push(current);
                    }
                    let [hours, minutes] = current.split(':').map(Number);
                    minutes += 15;
                    if (minutes >= 60) {
                        minutes -= 60;
                        hours += 1;
                    }
                    if (hours >= 24) {
                        break;
                    }
                    current = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                }
            }
        });
        if (params.am_booked) {
            let current = '09:00';
            while (isTimeBetween(current, '09:00', '13:30')) {
                if (isWithinWorkingHours(current)) {
                    disabledTimes.push(current);
                }
                let [hours, minutes] = current.split(':').map(Number);
                minutes += 15;
                if (minutes >= 60) {
                    minutes -= 60;
                    hours += 1;
                }
                if (hours >= 24) {
                    break;
                }
                current = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            }
        }
        if (params.pm_booked) {
            let current = '13:30';
            while (isTimeBetween(current, '13:30', '20:00')) {
                if (isWithinWorkingHours(current)) {
                    disabledTimes.push(current);
                }
                let [hours, minutes] = current.split(':').map(Number);
                minutes += 15;
                if (minutes >= 60) {
                    minutes -= 60;
                    hours += 1;
                }
                if (hours >= 24) {
                    break;
                }
                current = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            }
        }
        const uniqueTimes = Array.from(new Set(disabledTimes));
        return uniqueTimes.map(time => {
            const [hours, minutes] = time.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);
            return date;
        });
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

    const editEvent = () => {
        let params = JSON.parse(JSON.stringify(defaultParams));
        setParams(params);
        setActiveTour({
            am: null,
            pm: null,
            custom: null
        })
        disableDate();
        setCustomSlot(false);
        if (!isOpenAdd) {
            dispatch(toggleAddEvent());
            document.body.classList.add('overflow-hidden');
        }
    };

    useEffect(() => {
        if (user.city) {
            fatchTour();
        }
        eventHandle();
    }, [user])

    const fatchTour = async () => {
        try {
            const toursResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tours/city/${user.city}`, {
                headers: { 'Authorization': `bearer ${token}` }
            });
            const filteredTours = await toursResponse.data.filter((tour: any) => user.tours?.includes(tour.tour_name));
            setTours(filteredTours);
            const tourShortNames = filteredTours.reduce((map: any, tour: any) => {
                map[tour.tour_name] = tour.short_name;
                return map;
            }, {});
            setShortNames(tourShortNames);
        } catch (error) {
            console.error(error);
        }
    };

    const disableDate = (excludeDate: string | null = null) => {
        let matchingEvent = events;
        if (matchingEvent.length > 0) {
            const allStartValues = matchingEvent
                .flatMap((event: any) => dateFormat(event.start) + 'T23:59:59')
                .filter((date: string) => date !== excludeDate + 'T23:59:59');
            setDisabledDate(allStartValues);
        } else {
            setDisabledDate([]);
        }
    };

    const handleTimeChange = (index: number, date: any, type: TimeType) => {
        const timeString = date?.toTimeString().slice(0, 5);
        const updatedCustomTime = [...params.custom_time];
        const timeToComparableString = (time: Date) => time.toTimeString().slice(0, 5);
        const isOverlapping = (start1: string, end1: string, start2: string, end2: string) => {
            return (start1 < end2 && end1 > start2);
        };
        const newStartTime = type === 'startTime' ? timeString : updatedCustomTime[index].start;
        const newEndTime = type === 'endTime' ? timeString : updatedCustomTime[index].end;
        if (params.custom_time.some((picker: any, i: number) => {
            if (i === index) return false;
            const existingStartTime = picker.start;
            const existingEndTime = picker.end;
            return isOverlapping(newStartTime, newEndTime, existingStartTime, existingEndTime);
        })) {
            showMessage(t('Selected_time_range_overlaps_with_an_existing_time_range'), 'error');
            return;
        }

        const disabledTimes = getDisabledTimes(index);
        if (disabledTimes.some(disabledDate => timeToComparableString(disabledDate) === timeString)) {
            showMessage(t('selected_time_disabled'), 'error');
            if (type === 'startTime') {
                updatedCustomTime[index].start = '00:00';
                updatedCustomTime[index].end = '00:00';
            } else {
                updatedCustomTime[index].end = '00:00';
            }
            setParams((prevParams: any) => ({
                ...prevParams,
                custom_time: updatedCustomTime
            }));
        } else {
            if (type === 'startTime') {
                handleCustomStartChange(index, date);
            } else {
                handleCustomEndChange(index, date);
            }
        }
    };

    const handleCustomStartChange = (index: number, date: any) => {
        const timeString = date?.toTimeString().slice(0, 5);
        const updatedCustomTime = [...params.custom_time];
        updatedCustomTime[index].start = timeString;
        if (updatedCustomTime[index].start > updatedCustomTime[index].end) {
            updatedCustomTime[index].end = timeString;
        }
        setParams((prevParams: any) => ({
            ...prevParams,
            custom_time: updatedCustomTime
        }));
        if (index == 0) {
            TimingTours('custom', timeString, params.custom_time[0].end);
        }
    };

    const TimingTours = (slot: any, customStartOverride = '09:00', customEndOverride = '09:00') => {
        const slotTiming = {
            am: { start: '09:00', end: '13:30' },
            pm: { start: '13:30', end: '20:00' },
            custom: { start: customStartOverride, end: customEndOverride },
        };
        const selectedSlot = slot;
        const localDateTime = moment(localTime, 'h:mmA YYYY-MM-DD');
        const paramStartString = moment(params.start, "YYYY-MM-DDTHH:mm:ss").format('YYYY-MM-DD');
        let startTime = slotTiming[selectedSlot as SlotType].start;

        if (paramStartString === localDateTime.format('YYYY-MM-DD')) {
            if (selectedSlot === 'pm') {
                const oneThirtyPM = moment(localDateTime.format('YYYY-MM-DD') + ' 13:30', 'YYYY-MM-DD HH:mm');
                if (localDateTime.isAfter(oneThirtyPM)) {
                    startTime = localDateTime.format('HH:mm');
                }
            } else {
                startTime = localDateTime.format('HH:mm');
            }
        }
        const endTime = slotTiming[selectedSlot as SlotType].end;
        if (Array.isArray(tours)) {
            const filteredTourNames = tours.filter(tour => {
                const amBooked = params.am_booked !== null;
                const pmBooked = params.pm_booked !== null;
                const timeSlotFilter = selectedSlot === 'custom'
                    ? tour.start_times.some((time: any) => time.start_time >= startTime && time.end_time <= endTime)
                    : tour.start_times.some((time: any) => time.start_time >= startTime && time.start_time <= endTime);
                if (amBooked || pmBooked) {
                    // If either AM or PM is booked
                    return timeSlotFilter && !tour.combo; // Exclude combo tours
                } else {
                    // If neither is booked
                    if (selectedSlot !== 'custom') {
                        if (params.am === 'available' && params.pm === 'available') {
                            return timeSlotFilter; // Both slots available
                        } else {
                            return timeSlotFilter && !tour.combo; // Apply combo exclusion
                        }
                    }
                    return timeSlotFilter; // If custom slot selected and no bookings
                }
            }).map(tour => tour.tour_name);
            const updateToursAvailable = (slotType: any, filteredNames: any) => {
                newToursAvailable = {
                    ...newToursAvailable,
                    [slotType]: filteredNames
                };
                newParams = {
                    ...newParams,
                    [`${slotType}_tours`]: filteredNames.length ? filteredNames : ''
                };
            };
            if (selectedSlot === 'am') {
                if (params.am === 'available') {
                    updateToursAvailable('am', filteredTourNames);
                } else {
                    newToursAvailable.am = [];
                    newParams.am_tours = '';
                }
            } else if (selectedSlot === 'pm') {
                if (params.pm === 'available') {
                    updateToursAvailable('pm', filteredTourNames);
                } else {
                    newToursAvailable.pm = [];
                    newParams.pm_tours = '';
                }
            } else if (selectedSlot === 'custom') {
                if (params.custom === 'available') {
                    updateToursAvailable('custom', filteredTourNames);
                } else {
                    newToursAvailable.custom = [];
                    newParams.availableTours = '';
                }
            }
            setToursavailable(newToursAvailable);
            setParams(newParams);
        }
    };

    const nextTab = (slot: any) => {
        if (params.am == null && params.pm == null && params.custom == null) {
            showMessage(String(t('Please_select_your_availability')), 'error');
            return true;
        } else if (params.start == '' || params.end == '') {
            showMessage(String(t('Select_Your_Availibility_date')), 'error');
            return true;
        } else {
            if (slot == 'am' && params.am == 'available') {
                setActiveTour({ ...activeTour, am: 1 })
            }
            if (slot == 'pm' && params.pm == 'available') {
                setActiveTour({ ...activeTour, pm: 1 })
            }
            if (slot == 'custom' && params.custom == 'available') {
                setActiveTour({ ...activeTour, custom: 1 })
            }
        }
    }

    const handleSlotChange = (slot: 'am' | 'pm' | 'custom') => {
        if (slot === 'custom') {
            setCustomSlot(true);
        } else {
            setCustomButton(true);
            setCustomSlot(false);
        }
        setSlot(slot);
        setParams((prevParams: any) => {
            let newStatus: string | null = 'available';
            if (prevParams[slot] === 'available') {
                newStatus = 'unavailable';
            } else if (prevParams[slot] === 'unavailable') {
                newStatus = null;
            }
            let updatedParams = {
                ...prevParams,
                [slot]: newStatus
            };
            if (slot === 'custom' && newStatus !== null) {
                updatedParams = {
                    ...updatedParams,
                    am: null,
                    pm: null,
                    custom_time: [{ start: '09:00', end: '09:00', status: newStatus }]
                };
            } else if ((slot === 'am' || slot === 'pm') && newStatus !== null) {
                updatedParams = {
                    ...updatedParams,
                    custom: null,
                    custom_time: []
                };
            }
            return updatedParams;
        });
    };

    const handleCustomEndChange = (index: number, date: any) => {
        const timeString = date?.toTimeString().slice(0, 5);
        const updatedCustomTime = [...params.custom_time];
        updatedCustomTime[index].end = timeString;
        setParams((prevParams: any) => ({
            ...prevParams,
            custom_time: updatedCustomTime
        }));
        if (index == 0) {
            TimingTours('custom', params.custom_time[0].start, timeString)
        }
    };

    const isStartTimeBeforeEndTime = (startTime: string, endTime: string) => {
        if (startTime && endTime) {
            const [startHours, startMinutes] = startTime?.split(':').map(Number);
            const [endHours, endMinutes] = endTime?.split(':').map(Number);
            if (startHours < endHours) return true;
            if (startHours === endHours && startMinutes < endMinutes) return true;
            return false;
        }
    };

    const handleAddTimePicker = () => {
        setParams((prevParams: any) => ({
            ...prevParams,
            custom_time: [...prevParams.custom_time, { start: '09:00', end: '09:00', status: 'unavailable' }]
        }));
    };

    const saveEvent = async () => {
        if (params.start === '' || params.end === '') {
            showMessage(t('Select_Your_Availibility_date'), 'error');
            return;
        }
        if (params.am == null && params.pm == null && params.custom == null) {
            showMessage(t('Please_select_your_availability'), 'error');
            return;
        }
        if (Toursavailable.am.length !== 0 && params.am === 'available' && !params.am_tours) {
            showMessage(t('am_available_must_have_at_least_tour_selected'), 'error');
            return;
        }
        if (Toursavailable.pm.length !== 0 && params.pm === 'available' && !params.pm_tours) {
            showMessage(t('pm_available_must_have_at_least_tour_selected'), 'error');
            return;
        }

        const slotTiming = {
            am: { start: '09:00', end: '13:30' },
            pm: { start: '13:30', end: '20:00' },
            both: { start: '09:00', end: '20:00' },
            custom: { start: '09:00', end: '20:00' },
        };

        let selectedSlot = 'custom';
        if (params.am != null && params.pm != null) {
            selectedSlot = 'both';
        } else if (params.am != null) {
            selectedSlot = 'am';
        } else if (params.pm != null) {
            selectedSlot = 'pm';
        }

        let startTimeDate, endTimeDate;
        if ((params.am_booked != null || params.pm_booked != null) && params.custom != null) {
            startTimeDate = '09:00';
            endTimeDate = '20:00';
        } else {
            startTimeDate = slotTiming[selectedSlot as keyof typeof slotTiming].start;
            endTimeDate = slotTiming[selectedSlot as keyof typeof slotTiming].end;
        }

        const startDateTime = `${params.start}T${startTimeDate}:00`;
        const endDateTime = `${params.end}T${endTimeDate}:00`;

        if (params.custom != null) {
            for (const time of params.custom_time) {
                const { start, end } = time;
                if (start === '00:00' || end === '00:00') {
                    showMessage(t('Select_valid_Time'), 'error');
                    return;
                }
                if (!isStartTimeBeforeEndTime(start, end)) {
                    showMessage('Start time must be earlier than end time.', 'error');
                    return;
                }
            }
        }

        const updatedAt = new Date().toISOString();
        const updatedEvent = {
            start_date: startDateTime,
            start_time: startDateTime.split('T')[1],
            end_time: endDateTime.split('T')[1],
            end_date: endDateTime,
            am: params.am,
            pm: params.pm,
            am_tours: params.am_tours || [],
            pm_tours: params.pm_tours || [],
            custom: params.custom,
            status: '',
            type: '',
            tours: '',
            am_booked: params.am_booked,
            pm_booked: params.pm_booked,
            custom_times: JSON.stringify(params.custom_time),
            custom_tours: params.custom_tours || [],
            user_id: user.user_id,
            city: params.city || user.city,
            updated_at: updatedAt,
        };

        const axiosConfig = {
            headers: { Authorization: `bearer ${token}` },
        };
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/schedules`,
                updatedEvent,
                axiosConfig
            );
            showMessage(t('Availability_has_been_added'), 'success');
            eventHandle();
            dispatch(toggleAddEvent())
            setParams(defaultParams);
        } catch (error) {
            console.error(error);
        }
    };


    const handleTodayHighlight = () => {
        setTimeout(() => {
            const todayDatePickr = moment(localTime, 'h:mmA YYYY-MM-DD').format('MMMM D, YYYY');
            const todayButtons = document.querySelectorAll('.flatpickr-day[aria-label]');
            todayButtons.forEach(button => {
                if (button.classList.contains('today')) {
                    button.classList.remove('today');
                }
            });
            todayButtons.forEach(button => {
                if (button.getAttribute('aria-label') === todayDatePickr) {
                    button.classList.add('today');
                }
            });
        }, 100);
    }


    const handleSelectAll = (slot: any) => {
        if (slot == 'am') {
            setParams({ ...params, am_tours: Toursavailable.am });
        }
        if (slot == 'pm') {
            setParams({ ...params, pm_tours: Toursavailable.pm });
        }
        if (slot == 'custom') {
            setParams({ ...params, custom_tours: Toursavailable.custom });
        }
    };

    const handleTourChange = (e: any, slot: any) => {
        const tourValue = e.target.value;
        if (slot == 'custom') {
            let availableToursArray = params.custom_tours ? params.custom_tours : [];
            if (availableToursArray.includes(tourValue)) {
                availableToursArray = availableToursArray.filter((tour: any) => tour !== tourValue);
            } else {
                availableToursArray.push(tourValue);
            }
            setParams({ ...params, custom_tours: availableToursArray });
        }
        if (slot == 'am') {
            let AMToursArray = params.am_tours ? params.am_tours : [];
            if (AMToursArray.includes(tourValue)) {
                AMToursArray = AMToursArray.filter((tour: any) => tour !== tourValue);
            } else {
                AMToursArray.push(tourValue);
            }
            setParams({ ...params, am_tours: AMToursArray });
        }
        if (slot == 'pm') {
            let PMToursArray = params.pm_tours ? params.pm_tours : [];
            if (PMToursArray.includes(tourValue)) {
                PMToursArray = PMToursArray.filter((tour: any) => tour !== tourValue);
            } else {
                PMToursArray.push(tourValue);
            }
            setParams({ ...params, pm_tours: PMToursArray });
        }
    };

    useEffect(() => {
        if (!isOpenAdd) {
            if (router.pathname == '/booking') {
                dispatch(toggleNavigationView('booking'));
            }
            if (router.pathname == '/profile' || router.pathname == '/profile-edit') {
                dispatch(toggleNavigationView('profile'));
            }
            document.body.classList.remove('overflow-hidden');
        }
    }, [isOpenAdd])

    return (
        <div className={`fixed inset-0 z-50 flex items-end bg-black bg-opacity-50 ${isOpenAdd ? "translate-y-0" : "translate-y-full"}`} onClick={() => {
            dispatch(toggleAddEvent());
            setParams(defaultParams);
            setCustomSlot(false);
        }}>
            <div className={`offcanvas offcanvas-bottom AddEditEventModel bg-white w-full rounded-t-xl shadow-lg transform transition duration-500 ${isOpenAdd ? "translate-y-0" : "translate-y-full"
                }`} onClick={(e) => e.stopPropagation()}>
                <div className="flex relative">
                    <button type="button" onClick={() => {
                        dispatch(toggleAddEvent());
                        setParams(defaultParams);
                        setCustomSlot(false);
                    }} className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600">
                        <IconX />
                    </button>
                    <div className="bg-[#fbfbfb] py-3 rounded-t-lg text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                        Add Availability
                    </div>
                </div>
                <div className="max-h-[480px] overflow-y-auto">
                    <div className="min-h-full transition-all duration-200 px-4 py-4">
                        <div className="py-2 pt-0">
                            <div className="inline-block w-full">
                                <div className='transition-all duration-500 ease-in-out'>
                                    <div>
                                        <div>
                                            <div className='pb-3 relative'>
                                                <div className='mb-1 mt-0 border border-gray-200 rounded-lg shadow-md p-5'>
                                                    {/* Start Date Picker */}
                                                    <label>Start Date : </label>
                                                    <Flatpickr
                                                        value={params.start}
                                                        options={{
                                                            dateFormat: 'Y-m-d',
                                                            disable: [disablePastDates, ...disabledDate.map((date: any) => new Date(date))]
                                                        }}
                                                        placeholder="Select start date"
                                                        className="form-input"
                                                        onChange={(selectedDates) => {
                                                            if (selectedDates.length > 0) {
                                                                const startDate = dateFormat(selectedDates[0]);
                                                                setParams((prevParams: any) => ({
                                                                    ...prevParams,
                                                                    start: startDate,
                                                                    end: prevParams.end && moment(prevParams.end).isBefore(moment(startDate))
                                                                        ? startDate
                                                                        : prevParams.end,
                                                                    am: null,
                                                                    pm: null,
                                                                    custom_time: [{ start: '09:00', end: '09:00', status: null }]
                                                                }));
                                                            }
                                                        }}
                                                        onReady={handleTodayHighlight}
                                                        onMonthChange={handleTodayHighlight}
                                                        onValueUpdate={handleTodayHighlight}
                                                        required
                                                    />
                                                    {/* End Date Picker */}
                                                    <label className='pt-2'>End Date : </label>
                                                    <Flatpickr
                                                        value={params.end}
                                                        options={{
                                                            dateFormat: 'Y-m-d',
                                                            disable: [disablePastDates, ...disabledDate.map((date: any) => new Date(date))]
                                                        }}
                                                        placeholder="Select end date"
                                                        className="form-input"
                                                        onChange={(selectedDates) => {
                                                            if (selectedDates.length > 0) {
                                                                const endDate = dateFormat(selectedDates[0]);
                                                                setParams((prevParams: any) => ({
                                                                    ...prevParams,
                                                                    end: endDate,
                                                                    am: null,
                                                                    pm: null,
                                                                    custom_time: [{ start: '09:00', end: '09:00', status: null }]
                                                                }));
                                                            }
                                                        }}
                                                        onReady={handleTodayHighlight}
                                                        onMonthChange={handleTodayHighlight}
                                                        onValueUpdate={handleTodayHighlight}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-5 mt-0 border border-gray-200 rounded-lg shadow-md p-5">
                                            <div>
                                                <div>
                                                    <label className='text-left'>{t('availability')}:</label>
                                                    <div className="mt-3">
                                                        {/* Am Tours */}
                                                        <div>
                                                            <div className='flex pb-2 justify-between items-center'>
                                                                <label className={`btn btn-lg pl-4 btn-primary w-[78%] justify-between inline-flex font-normal cursor-default`}>
                                                                    <span className="ltr:pl-2 rtl:pr-2 text-lg">AM Tours</span>
                                                                    <input id="checkbox" type="checkbox" checked={params.am === 'available'} readOnly />
                                                                    <label className={`switch mb-0  ${params.am} cursor-pointer`} onClick={() => handleSlotChange('am')}></label>
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    className={`text-primary text-sm bg-gray-200 hover:bg-gray-300 transition-all duration-300 rounded-xl px-2 p-1 ml-3 ${params.am === 'available' ? 'opacity-100 cursor-pointer' : 'opacity-0 cursor-default'}`}
                                                                    onClick={() => nextTab('am')}>
                                                                    Edit Tours
                                                                </button>
                                                            </div>
                                                            {activeTour.am == 1 && params.am == 'available' && <div className="mb-5 border-t pt-2 border-gray-200">
                                                                <div>
                                                                    <div className='flex justify-between'>
                                                                        <label htmlFor="dateStart">{t('tours')} :</label>
                                                                        <button className='btn btn-primary btn-sm' onClick={() => handleSelectAll('am')}>Select All</button>
                                                                    </div>
                                                                    <div>
                                                                        <div className="">
                                                                            {Toursavailable.am?.map((tour: any, id: any) => (
                                                                                <label key={id} className="block cursor-pointer rtl:ml-3 font-normal">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        className="form-checkbox outline-primary"
                                                                                        name="tour1"
                                                                                        checked={params.am_tours ? params.am_tours.includes(tour) : false}
                                                                                        value={tour}
                                                                                        onChange={(e) => handleTourChange(e, 'am')}
                                                                                    />
                                                                                    <span className="ltr:pl-2 rtl:pr-2">{shortNames[tour]}</span>
                                                                                </label>
                                                                            ))}
                                                                            {Toursavailable.am?.length == 0 && (
                                                                                <i>{t('No_tours_within_selected_time')}</i>
                                                                            )}
                                                                            {user.tours?.length == 0 && (
                                                                                <i>{t('Please_add_tours_from_your_profile')}</i>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>}
                                                        </div>
                                                        {/* pm Tours */}
                                                        <div>
                                                            <div className='flex pb-2 items-center justify-between'>
                                                                <label className={`btn btn-lg pl-4 btn-primary w-[78%] justify-between inline-flex font-normal cursor-default`}>
                                                                    <span className="ltr:pl-2 rtl:pr-2 text-lg">PM Tours</span>
                                                                    <input id="checkbox" type="checkbox" checked={params.pm === 'available'} readOnly />
                                                                    <label onClick={() => handleSlotChange('pm')} className={`switch mb-0 ${params.pm} 'cursor-pointer'`}></label>
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    className={`text-primary text-sm bg-gray-200 hover:bg-gray-300 transition-all duration-300 p-1 px-2 rounded-xl text-center ml-3 ${params.pm === 'available' ? 'opacity-100 cursor-pointer' : 'opacity-0 cursor-default'}`}
                                                                    onClick={() => nextTab('pm')}>
                                                                    Edit Tours
                                                                </button>
                                                            </div>
                                                            {activeTour.pm == 1 && params.pm == 'available' && <div className="mb-5 border-t pt-2 border-gray-200">
                                                                <div>
                                                                    <div className='flex justify-between'>
                                                                        <label htmlFor="dateStart">{t('tours')} :</label>
                                                                        <button className='btn btn-primary btn-sm' onClick={() => handleSelectAll('pm')}>Select All</button>
                                                                    </div>
                                                                    <div>
                                                                        <div className="">
                                                                            {Toursavailable.pm?.map((tour: any, id: any) => (
                                                                                <label key={id} className="block cursor-pointer rtl:ml-3 font-normal">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        className="form-checkbox outline-primary"
                                                                                        name="tour1"
                                                                                        checked={params.pm_tours ? params.pm_tours.includes(tour) : false}
                                                                                        value={tour}
                                                                                        onChange={(e) => handleTourChange(e, 'pm')}
                                                                                    />
                                                                                    <span className="ltr:pl-2 rtl:pr-2">{shortNames[tour]}</span>
                                                                                </label>
                                                                            ))}
                                                                            {Toursavailable.pm?.length == 0 && (
                                                                                <i>{t('No_tours_within_selected_time')}</i>
                                                                            )}
                                                                            {user.tours?.length == 0 && (
                                                                                <i>{t('Please_add_tours_from_your_profile')}</i>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>}
                                                        </div>
                                                        {/* Custom Tours */}
                                                        {customButton && <p className='text-primary cursor-pointer pb-3' onClick={() => {
                                                            setCustomButton(false);
                                                        }}>Need to set a Custom Schedule?</p>}
                                                        {!customButton && <div className='flex justify-between items-center'>
                                                            <div className='btn btn-lg btn-primary pl-4 py-2.5 w-[78%] max-h-[62px] h-full min-h-[62px] justify-between inline-flex cursor-pointer font-normal'>
                                                                <span>Custom Hours</span>
                                                                {params.custom_time?.length <= 1 && <div className='flex items-center'>
                                                                    <input id="checkbox" type="checkbox" checked={params.custom === 'available'} readOnly />
                                                                    <label className={`switch mb-0 ${params.custom}`} onClick={() => handleSlotChange('custom')}></label>
                                                                </div>}
                                                            </div>
                                                            <div>
                                                                <button
                                                                    type="button"
                                                                    className={`text-primary text-sm bg-gray-200 hover:bg-gray-300 transition-all duration-300 rounded-xl px-2 p-1 ml-3 ${params.custom === 'available' ? 'opacity-100' : 'opacity-0'}`}
                                                                    onClick={() => nextTab('custom')}>
                                                                    Edit Tours
                                                                </button>
                                                            </div>
                                                        </div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {customSlot && <div className="">
                                            <div className='relative'>
                                                {params.custom_time?.map((picker: any, index: any) => (
                                                    <div className='mb-5 mt-4 border border-gray-200 rounded-lg shadow-md p-5 relative' key={index}>
                                                        {params.custom_time.length > 1 && (
                                                            <div className='flex items-center'>
                                                                <label>{t('status')} :</label>
                                                                <label className="w-12 h-6 relative ml-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        onClick={() => handleCustomStatus(index)}
                                                                        checked={picker.status === 'available'}
                                                                        className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                                                        id={`custom_switch_checkbox${index}`}
                                                                    />
                                                                    <span className="outline_checkbox bg-icon border-2 border-red-300 dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-danger before:bottom-1 before:w-4 before:h-4 before:rounded-full before:bg-[url(/assets/images/close.svg)] before:bg-no-repeat before:bg-center peer-checked:before:left-7 peer-checked:before:bg-[url(/assets/images/checked.svg)] peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300"></span>
                                                                </label>
                                                            </div>
                                                        )}
                                                        <div className='pb-3'>
                                                            <label htmlFor={`dateStart-${index}`}>{t('from')} :</label>
                                                            <DatePicker
                                                                selected={getPickerTime(picker.start)}
                                                                onChange={(time) => handleTimeChange(index, time, 'startTime')}
                                                                showTimeSelect
                                                                showTimeSelectOnly
                                                                timeIntervals={15}
                                                                timeCaption="Time"
                                                                dateFormat="h:mm aa"
                                                                minTime={minTime}
                                                                maxTime={maxTime}
                                                                excludeTimes={getDisabledTimes(index)}
                                                                wrapperClassName="form-input"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label htmlFor={`dateEnd-${index}`}>{t('to')} :</label>
                                                            <DatePicker
                                                                selected={getPickerTime(picker.end)}
                                                                onChange={(time) => handleTimeChange(index, time, 'endTime')}
                                                                showTimeSelect
                                                                showTimeSelectOnly
                                                                timeIntervals={15}
                                                                timeCaption="Time"
                                                                dateFormat="h:mm aa"
                                                                minTime={picker.start ? getPickerTime(picker.start) : minTime}
                                                                maxTime={maxTime}
                                                                excludeTimes={getDisabledTimes(index)}
                                                                wrapperClassName="form-input"
                                                            />
                                                        </div>
                                                        {params.custom_time.length != 1 && (
                                                            <button onClick={() => CustomTimeDelete(index)} className='absolute right-3 top-2 text-xl py-1.5 px-1.5 text-danger'>
                                                                <IconTrashLines />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button onClick={handleAddTimePicker} className='absolute right-3 top-2 btn btn-primary rounded-full btn-sm text-xl py-1.5 px-1.5'>
                                                    <IconPlus />
                                                </button>
                                            </div>
                                            {activeTour.custom == 1 && params.custom == 'available' && (
                                                <div className="mb-5 border-t pt-2 border-gray-200">
                                                    <div>
                                                        <div className='flex justify-between'>
                                                            <label htmlFor="dateStart">{t('tours')} :</label>
                                                            <button className='btn btn-primary btn-sm' onClick={() => handleSelectAll('custom')}>Select All</button>
                                                        </div>
                                                        <div>
                                                            <div className="">
                                                                {Toursavailable.custom?.map((tour: any, id: any) => (
                                                                    <label key={id} className="block cursor-pointer rtl:ml-3 font-normal">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="form-checkbox outline-primary"
                                                                            name="tour1"
                                                                            checked={params.custom_tours ? params.custom_tours.includes(tour) : false}
                                                                            value={tour}
                                                                            onChange={(e) => handleTourChange(e, 'custom')}
                                                                        />
                                                                        <span className="ltr:pl-2 rtl:pr-2">{shortNames[tour]}</span>
                                                                    </label>
                                                                ))}
                                                                {Toursavailable.custom?.length == 0 && (
                                                                    <i>{t('No_tours_within_selected_time')}</i>
                                                                )}
                                                                {user.tours?.length == 0 && (
                                                                    <i>{t('Please_add_tours_from_your_profile')}</i>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>}
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <button type="button" onClick={(e) => { e.preventDefault(); saveEvent(); }} className="btn btn-primary ltr:ml-auto rtl:mr-auto">{t('add_availability')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddEditModel;