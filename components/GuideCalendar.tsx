import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { useEffect, useState } from 'react';
import moment from 'moment';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import IconInfoCircle from './Icon/IconInfoCircle';
import axios from 'axios';
import ReactDOMServer from 'react-dom/server';
import { useDispatch, useSelector } from 'react-redux';
import { toggleAddEditEvent, toggleNavigationView } from '@/store/themeConfigSlice';
import IconX from './Icon/IconX';
import { IRootState } from '@/store';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import IconPlus from './Icon/IconPlus';
import IconTrashLines from './Icon/IconTrashLines';
import IconCheck from './Icon/IconCheck';
import IconCancel from './Icon/IconCancel';

type SlotType = 'am' | 'pm' | 'custom';

interface TimePicker {
  start: string;
  end: string;
  status: any;
}
type TimeType = 'startTime' | 'endTime';

const GuideCalendar = ({ eventHandle, events, showMessage, token, localTime, selectedGuideCity, today, user }: any) => {
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [shortNames, setShortNames] = useState([]);
  const [customSlot, setCustomSlot] = useState(false);
  const [disabledDate, setDisabledDate] = useState<any>([]);
  const [customButton, setCustomButton] = useState(true);
  const active = useSelector((state: IRootState) => state.themeConfig.NavigationView);
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
  const [slot, setSlot] = useState('');
  const [params, setParams] = useState<any>(defaultParams);
  const [tours, setTours] = useState<any>([]);
  const [activeTour, setActiveTour] = useState<any>({
    am: null,
    pm: null,
    custom: null
  })
  const [Toursavailable, setToursavailable] = useState({
    am: [],
    pm: [],
    custom: []
  });
  let newParams = { ...params };
  let newToursAvailable = { ...Toursavailable };
  const dispatch = useDispatch();
  const isOpen = useSelector((state: IRootState) => state.themeConfig.addEditEvent);
  const { t } = useTranslation();
  const [selectedCalendarDate, setSelectedCalendarDate] = useState();

  const fatchTour = async () => {
    try {
      const toursResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tours/city/${user.city}`, {
        headers: { 'Authorization': `bearer ${token}` }
      });
      const filteredTours = await toursResponse.data.filter((tour: any) => user.tours?.includes(tour.tour_name));
      const tourTimesMap = filteredTours.reduce((map: any, tour: any) => {
        map[tour.tour_name] = tour.start_times;
        return map;
      }, {});
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

  const dateFormat = (dt: any) => {
    dt = new Date(dt);
    const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
    const date = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
    dt = dt.getFullYear() + '-' + month + '-' + date;
    return dt;
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

  useEffect(() => {
    if (user.city) {
      fatchTour();
    }
    eventHandle();
  }, [user])

  const nextTab = (slot: any) => {
    if (params.am == null && params.pm == null && params.custom == null) {
      showMessage(t('Please_select_your_availability'), 'error');
      return true;
    } else if (params.start == '' || params.end == '') {
      showMessage(t('Select_Your_Availibility_date'), 'error');
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

  useEffect(() => {
    setSelectedCalendarDate(today);
    const todayDate = moment(today).format('YYYY-MM-DD');
    const todayEvents = events.filter((event: any) =>
      moment(event.start).isSame(todayDate, 'day')
    );
    setFilteredEvents(todayEvents);
  }, [today]);

  const filterEventsByDate = (date: any) => {
    setSelectedCalendarDate(date);
    const selectedDate = moment(date).format('YYYY-MM-DD');
    const selectedEvents = events.filter((event: any) =>
      moment(event.start).isSame(selectedDate, 'day')
    );
    setFilteredEvents(selectedEvents);
  };

  const generateToursMarkup = (userTours: any, booked?: any) => {
    return ReactDOMServer.renderToStaticMarkup(
      <>
        {booked ? (
          <>
            <span className='text-xs text-black font-semibold pl-1'>- {booked[0]?.tour_name}<br></br></span>
          </>
        ) : (
          <>
            {userTours?.map((tour: any, index: any) => (
              <span className='text-xs text-black font-semibold pl-1' key={index}>- {shortNames[tour]}<br></br></span>
            ))}
          </>
        )}
      </>
    );
  };

  const disablePastDates = (date: any) => {
    const todayDate: any = new Date(moment(localTime, 'h:mmA YYYY-MM-DD').format('MMMM D, YYYY'));
    todayDate.setHours(0, 0, 0, 0);
    return date < todayDate;
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

  const CustomSlotHandle = () => {
    setCustomButton(false);
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

  const TimingTourEdit = (slot: 'am' | 'pm' | 'custom', startDate: any, am_booked: any, pm_booked: any, am: any, pm: any, customStartOverride = '09:00', customEndOverride = '09:00') => {
    const slotTiming = {
      am: { start: '09:00', end: '13:30' },
      pm: { start: '13:30', end: '20:00' },
      custom: { start: customStartOverride, end: customEndOverride },
    };
    const selectedSlot = slot;
    const localDateTime = moment(localTime, 'h:mmA YYYY-MM-DD');
    const paramStartString = moment(startDate, "YYYY-MM-DDTHH:mm:ss").format('YYYY-MM-DD');
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
    const endTime = slotTiming[selectedSlot].end;
    if (Array.isArray(tours)) {
      const filteredTourNames = tours.filter(tour => {
        const amBooked = am_booked !== null;
        const pmBooked = pm_booked !== null;
        const timeSlotFilter = selectedSlot === 'custom'
          ? tour.start_times.some((time: any) => time.start_time >= startTime && time.end_time <= endTime)
          : tour.start_times.some((time: any) => time.start_time >= startTime && time.start_time <= endTime);
        if (amBooked || pmBooked) {
          return timeSlotFilter && !tour.combo;
        } else {
          if (selectedSlot !== 'custom') {
            if (am === 'available' && pm === 'available') {
              return timeSlotFilter;
            } else {
              return timeSlotFilter && !tour.combo;
            }
          }
          return timeSlotFilter;
        }
      }).map(tour => tour.tour_name);
      setToursavailable(prevToursAvailable => ({
        ...prevToursAvailable,
        [slot]: filteredTourNames
      }));
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

  const CustomTimeDelete = (index: number) => {
    const newCustomTime = [...params.custom_time.slice(0, index), ...params.custom_time.slice(index + 1)];
    setParams((prevParams: any) => ({
      ...prevParams,
      custom_time: newCustomTime
    }));
  };

  const handleAddTimePicker = () => {
    setParams((prevParams: any) => ({
      ...prevParams,
      custom_time: [...prevParams.custom_time, { start: '09:00', end: '09:00', status: 'unavailable' }]
    }));
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

  const editEvent = (data: any = null) => {
    let obj;
    if (data) {
      obj = data;
    } else {
      obj = null;
    }
    if (obj?.extendedProps) {
      if (obj.extendedProps.am_booked != null && obj.extendedProps.pm_booked != null) {
        return false;
      }
    } else {
      if (obj?.am_booked != null && obj?.pm_booked != null) {
        return false;
      }
    }
    let params = JSON.parse(JSON.stringify(defaultParams));
    setParams(params);
    setActiveTour({
      am: null,
      pm: null,
      custom: null
    })
    disableDate();
    setCustomSlot(false);
    if (data) {
      let startTime, endTime;
      if (obj.extendedProps?.custom_time) {
        startTime = obj.extendedProps?.custom_time[0]?.start;
        endTime = obj.extendedProps?.custom_time[0]?.end;
      }
      if (obj.id) {
        if (obj.extendedProps?.status == 'booked' || obj.status == 'booked') {
          showMessage(t('You_cannot_edit_a_booked_event'));
          return true;
        }
        disableDate(dateFormat(obj.start));
        if (obj.extendedProps ? obj.extendedProps.custom : (obj.custom && obj.custom) != null) {
          setCustomButton(false);
          setCustomSlot(true);
        } else {
          setCustomButton(true);
          setCustomSlot(false);
        }
      }
      const am_booked = obj.extendedProps ? obj.extendedProps.am_booked : (obj.am_booked ? obj.am_booked : null)
      const pm_booked = obj.extendedProps ? obj.extendedProps.pm_booked : (obj.pm_booked ? obj.pm_booked : null)
      const am = obj.extendedProps ? obj.extendedProps.am : (obj.am && obj.am)
      const pm = obj.extendedProps ? obj.extendedProps.pm : (obj.pm && obj.pm)
      if (obj.extendedProps ? obj.extendedProps.custom : (obj.custom && obj.custom) == 'available') {
        TimingTourEdit('custom', obj.start, am_booked, pm_booked, am, pm, startTime, endTime);
      }
      if (obj.extendedProps ? obj.extendedProps.am : (obj.am && obj.am) == 'available') {
        TimingTourEdit('am', obj.start, am_booked, pm_booked, am, pm);
      }
      if (obj.extendedProps ? obj.extendedProps.pm : (obj.pm && obj.pm) == 'available') {
        TimingTourEdit('pm', obj.start, am_booked, pm_booked, am, pm);
      }
      setParams({
        id: obj.id ? obj.id : null,
        title: obj.title ? obj.title : null,
        start: moment(obj.start, "YYYY-MM-DDTHH:mm:ss").format('YYYY-MM-DD'),
        end: moment(obj.end, "YYYY-MM-DDTHH:mm:ss").format('YYYY-MM-DD'),
        am: am,
        pm: pm,
        city: obj.extendedProps ? obj.extendedProps.city != null ? obj.extendedProps.city : user.city : (obj.city ? obj.city : user.city),
        custom: obj.extendedProps ? obj.extendedProps.custom : (obj.custom && obj.custom),
        am_tours: obj.extendedProps ? obj.extendedProps.am_tours : (obj.am_tours && obj.am_tours),
        pm_tours: obj.extendedProps ? obj.extendedProps.pm_tours : (obj.pm_tours && obj.pm_tours),
        custom_tours: obj.extendedProps ? obj.extendedProps.custom_tours : (obj.custom_tours && obj.custom_tours),
        custom_time: obj.extendedProps ? obj.extendedProps.custom_time : (obj.custom_time ? obj.custom_time : []),
        am_booked: am_booked,
        pm_booked: pm_booked
      });
      setSlot('');
    }
    if (!isOpen) {
      dispatch(toggleAddEditEvent());
      document.body.classList.add('overflow-hidden');
    }
  };

  useEffect(() => {
    if (isOpen) {
      dispatch(toggleNavigationView('calendar'));
    }
  }, [isOpen])

  // useEffect(() => {
  //   if (active == "NewEvent") {
  //     editEvent();
  //   }
  // }, [active])

  useEffect(() => {
    console.log("GuideCalendar", active);
  }, [active])

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
      if (params.id) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/schedules/${params.id}`,
          updatedEvent,
          axiosConfig
        );
        showMessage(t('Availability_has_been_updated'), 'success');
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/schedules`,
          updatedEvent,
          axiosConfig
        );
        showMessage(t('Availability_has_been_added'), 'success');
      }
      eventHandle();
      dispatch(toggleAddEditEvent())
      setParams(defaultParams);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (active == 'NewEvent') {
      editEvent();
    }
  }, [active])

  useEffect(() => {
    if (events) {
      filterEventsByDate(selectedCalendarDate);
    }
  }, [events])

  return (
    <div>
      <div className='flex item-center justify-center px-3 py-2.5 mb-3 rounded text-primary bg-primary-light'>
        <span className='rtl:pl-2 ltr:pr-2'>
          <strong className='rtl:ml-1 ltr:mr-1'>{selectedGuideCity && selectedGuideCity.city} Local Time </strong> {localTime}
        </span>
      </div>
      <div className='formDate MainCalendar'>
        <Flatpickr
          key={today}
          options={{
            dateFormat: 'Y-m-d',
            inline: true,
            defaultDate: new Date(),
            onChange: (selectedDates) => {
              if (selectedDates.length > 0) {
                filterEventsByDate(selectedDates[0]);
              }
            },
            disable: [disablePastDates],
            onReady: (selectedDates, dateStr, instance) => {
              const todayButton = document.createElement('button');
              todayButton.innerText = 'today';
              todayButton.className = 'ml-1 py-[4.8px] px-[7.8px] leading-[10px] text-white border border-primary text-xs bg-primary rounded shadow absolute top-2 left-1';
              todayButton.onclick = () => {
                instance.setDate(today, true);
              };
              const navContainer = instance.calendarContainer.querySelector('.flatpickr-month');
              navContainer?.appendChild(todayButton);
            },
          }}
          className="form-input w-full"
          onReady={handleTodayHighlight}
          onMonthChange={handleTodayHighlight}
          onValueUpdate={handleTodayHighlight}
        />
      </div>
      <div className="mt-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event: any, index: number) => (
            <div key={index}>
              {event.am_booked != null ? (
                <div className='flex items-center p-3 relative border-b'>
                  <div className="h-7 w-7 bg-[#4d69eb] rounded-full flex justify-center items-center border-4 border-[#c7d1ff] mr-2 text-white font-bold">
                    <IconCheck className="h-3 w-3" />
                  </div>
                  <Tippy
                    content={
                      <div
                        dangerouslySetInnerHTML={{
                          __html: generateToursMarkup(tours, event.am_booked),
                        }}
                      />
                    }
                    theme="light"
                  >
                    <div className="">
                      <p className="line-clamp-1 font-semibold">
                        {shortNames[event.am_booked[0].tour_name]}
                      </p>
                      <p>
                        {event.am_booked[0].start_time} | {event.am_booked[0].group}
                      </p>
                    </div>
                  </Tippy>
                </div>
              ) : event.am != null ? (
                <div className={`p-3 relative border-b`}>
                  <div className="flex items-center" onClick={() => editEvent(event)}>
                    {event.am == "available" ? (
                      <div className="h-7 w-7 bg-[#5fd788] rounded-full flex justify-center items-center border-4 border-[#caf0d9] mr-2 text-white font-bold">
                        <IconCheck className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="h-7 w-7 bg-[#f15d5d] rounded-full flex justify-center items-center border-4 border-[#ffc5c5] mr-2 text-white font-bold">
                        <IconCancel className="h-4 w-4 font-bold" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">AM</p>
                      {event.am_tours?.length == 0 ? (
                        <p>No Tours Available</p>
                      ) : (
                        <p>Tours Available {event.am_tours?.length}</p>
                      )}
                    </div>
                  </div>
                  {event.am_tours?.length != 0 && (
                    <Tippy
                      content={
                        <div
                          dangerouslySetInnerHTML={{
                            __html: generateToursMarkup(event.am_tours),
                          }}
                        />
                      }
                      theme="light"
                      placement="top"
                    >
                      <div className="absolute right-1 bottom-3 cursor-pointer">
                        <IconInfoCircle className="h-5 w-5" />
                      </div>
                    </Tippy>
                  )}
                </div>
              ) : null}
              {event.pm_booked != null ? (
                <div className='flex items-center p-3 relative border-b'>
                  <div className="h-7 w-7 bg-[#4d69eb] rounded-full flex justify-center items-center border-4 border-[#c7d1ff] mr-2 text-white font-bold">
                    <IconCheck className="h-3 w-3" />
                  </div>
                  <Tippy
                    content={
                      <div
                        dangerouslySetInnerHTML={{
                          __html: generateToursMarkup(tours, event.pm_booked),
                        }}
                      />
                    }
                    theme="light"
                  >
                    <div className="">
                      <p className="line-clamp-1 font-semibold">
                        {shortNames[event.pm_booked[0].tour_name]}
                      </p>
                      <p>
                        {event.pm_booked[0].start_time} | {event.pm_booked[0].group}
                      </p>
                    </div>
                  </Tippy>
                </div>
              ) : event.pm != null ? <div className={`p-3 relative border-b`}>
                <div className='flex items-center' onClick={() => editEvent(event)}>
                  {event.pm == 'available' ? (
                    <div className='h-7 w-7 bg-[#5fd788] rounded-full flex justify-center items-center border-4 border-[#caf0d9] mr-2 text-white font-bold'>
                      <IconCheck className='h-3 w-3' />
                    </div>
                  ) : (<div className='h-7 w-7 bg-[#f15d5d] rounded-full flex justify-center items-center border-4 border-[#ffc5c5] mr-2 text-white font-bold'>
                    <IconCancel className='h-4 w-4 font-bold' />
                  </div>)}
                  <div>
                    <p className='font-semibold'>PM</p>
                    {event.pm_tours?.length == 0 ? <p>No Tours Available</p> : <p>Tours Available {event.pm_tours?.length}</p>}
                  </div>
                </div>
                {event.pm_tours?.length != 0 &&
                  <Tippy content={<div dangerouslySetInnerHTML={{ __html: generateToursMarkup(event.pm_tours) }} />} theme="light" placement='top'>
                    <div className='absolute right-1 bottom-3 cursor-pointer'><IconInfoCircle className='h-5 w-5' /></div>
                  </Tippy>
                }
              </div> : null}
              {event.custom != null && <div>
                {event.custom_time.map((item: any, index: number) => (
                  <div className={`p-3 relative border-b`} key={index}>
                    <div className='flex items-center' onClick={() => editEvent(event)}>
                      {item.status == 'available' ? (
                        <div className='h-7 w-7 bg-[#5fd788] rounded-full flex justify-center items-center border-4 border-[#caf0d9] mr-2 text-white font-bold'>
                          <IconCheck className='h-3 w-3' />
                        </div>
                      ) : (<div className='h-7 w-7 bg-[#f15d5d] rounded-full flex justify-center items-center border-4 border-[#ffc5c5] mr-2 text-white font-bold'>
                        <IconCancel className='h-4 w-4 font-bold' />
                      </div>)}
                      <div>
                        <p className='font-semibold'>{item.start} - {item.end}</p>
                        {item.status == 'available' ? (
                          <>
                            {event.custom_tours?.length == 0 ? (
                              <p>No Tours Available</p>
                            ) : (
                              <p>Tours Available {event.custom_tours?.length}</p>
                            )}
                          </>
                        ) : (
                          <p>No Tours Available</p>
                        )}
                      </div>
                    </div>
                    {event.custom_tours?.length != 0 && item.status == 'available' && (
                      <Tippy
                        content={
                          <div
                            dangerouslySetInnerHTML={{
                              __html: generateToursMarkup(event.custom_tours),
                            }}
                          />
                        }
                        theme="light"
                        placement="top"
                      >
                        <div className="absolute right-1 bottom-3 cursor-pointer">
                          <IconInfoCircle className="h-5 w-5" />
                        </div>
                      </Tippy>
                    )}
                  </div>
                ))}
              </div>}
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center">
            No events available for this date.
          </div>
        )}
      </div>
      {/* Add/Edit event */}
      <div className={`fixed inset-0 z-50 flex items-end bg-black bg-opacity-50 ${isOpen ? "translate-y-0" : "translate-y-full"}`} onClick={() => {
        dispatch(toggleAddEditEvent());
        setParams(defaultParams);
        setCustomSlot(false);
      }}>
        <div className={`offcanvas offcanvas-bottom bg-white w-full rounded-t-xl shadow-lg transform transition duration-500 ${isOpen ? "translate-y-0" : "translate-y-full"
          }`} onClick={(e) => e.stopPropagation()}>
          <div className="flex relative">
            <button type="button" onClick={() => {
              dispatch(toggleAddEditEvent());
              setParams(defaultParams);
              setCustomSlot(false);
            }} className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600">
              <IconX />
            </button>
            <div className="bg-[#fbfbfb] py-3 rounded-t-lg text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
              {params.id ? 'Update Availability' : 'Add Availability'}
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
                          {(params.am_booked != null || params.pm_booked != null) && (
                            <div className="absolute inset-0 cursor-no-drop bg-gray-50/30 z-[999]">
                            </div>
                          )}
                          <div className='mb-1 mt-0 border border-gray-200 rounded-lg shadow-md p-5'>
                            {/* Start Date Picker */}
                            <label>Start Date : </label>
                            <Flatpickr
                              value={params.start}
                              options={{
                                dateFormat: 'Y-m-d',
                                disable:
                                  params.am_booked != null || params.pm_booked != null
                                    ? [
                                      (date) => {
                                        const startDate = moment(params.start);
                                        return !startDate.isSame(moment(date), 'day');
                                      }
                                    ]
                                    : [disablePastDates, ...disabledDate.map((date: any) => new Date(date))]
                              }}
                              placeholder="Select start date"
                              className="form-input"
                              onChange={(selectedDates) => {
                                if (params.am_booked != null || params.pm_booked != null) {
                                  showMessage(t('cant_change_date_booked'));
                                  return;
                                }
                                if (selectedDates.length > 0) {
                                  const startDate = dateFormat(selectedDates[0]);
                                  setParams((prevParams: any) => ({
                                    ...prevParams,
                                    start: startDate,
                                    end: prevParams.end && moment(prevParams.end).isBefore(moment(startDate))
                                      ? startDate
                                      : prevParams.end, // Adjust the end date if it's earlier than start date
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
                                disable:
                                  params.am_booked != null || params.pm_booked != null
                                    ? [
                                      (date) => {
                                        const startDate = moment(params.start);
                                        return !startDate.isSame(moment(date), 'day');
                                      }
                                    ]
                                    : [disablePastDates, ...disabledDate.map((date: any) => new Date(date))]
                              }}
                              placeholder="Select end date"
                              className="form-input"
                              onChange={(selectedDates) => {
                                if (params.am_booked != null || params.pm_booked != null) {
                                  showMessage(t('cant_change_date_booked'));
                                  return;
                                }
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
                                    <input id="checkbox" type="checkbox" checked={params.am_booked == null ? (params.am === 'available') : false} readOnly />
                                    <label className={`switch mb-0 ${params.am_booked == null ? params.am : null} ${params.am_booked == null ? 'cursor-pointer' : 'cursor-default'}`} onClick={params.am_booked == null ? () => handleSlotChange('am') : undefined}></label>
                                  </label>
                                  <button
                                    type="button"
                                    className={`text-primary text-sm bg-gray-200 hover:bg-gray-300 transition-all duration-300 rounded-xl px-2 p-1 ml-3 ${params.am_booked == null ? params.am === 'available' ? 'opacity-100 cursor-pointer' : 'opacity-0 cursor-default' : 'opacity-0 cursor-default'}`}
                                    onClick={params.am_booked == null ? () => nextTab('am') : undefined}>
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
                                    <input id="checkbox" type="checkbox" checked={params.pm_booked == null ? (params.pm === 'available') : false} readOnly />
                                    <label onClick={params.pm_booked == null ? () => handleSlotChange('pm') : undefined} className={`switch mb-0 ${params.pm_booked == null ? params.pm : null} ${params.pm_booked == null ? 'cursor-pointer' : 'cursor-default'}`}></label>
                                  </label>
                                  <button
                                    type="button"
                                    className={`text-primary text-sm bg-gray-200 hover:bg-gray-300 transition-all duration-300 p-1 px-2 rounded-xl text-center ml-3 ${params.pm_booked == null ? params.pm === 'available' ? 'opacity-100 cursor-pointer' : 'opacity-0 cursor-default' : 'opacity-0 cursor-default'}`}
                                    onClick={params.pm_booked == null ? () => nextTab('pm') : undefined}>
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
                              {params.am_booked != null || params.pm_booked == null && customButton && <p className='text-primary cursor-pointer pb-3' onClick={CustomSlotHandle}>Need to set a Custom Schedule?</p>}
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
                                  {Toursavailable.custom?.map((tour, id) => (
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
                    <button type="button" onClick={(e) => { e.preventDefault(); saveEvent(); }} className="btn btn-primary ltr:ml-auto rtl:mr-auto">{params.id ? t('update_availability') : t('add_availability')}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuideCalendar;
