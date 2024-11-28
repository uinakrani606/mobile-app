import { FC } from 'react';

interface IconNavigationBookingProps {
    className?: string;
}

const NavigationBooking: FC<IconNavigationBookingProps> = ({ className }) => {
    return (
        //     <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        //         <path d="M12.3701 8.87988H17.6201" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        //         <path d="M6.37988 8.87988L7.12988 9.62988L9.37988 7.37988" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        //         <path d="M12.3701 15.8799H17.6201" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        //         <path d="M6.37988 15.8799L7.12988 16.6299L9.37988 14.3799" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        //         <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        //     </svg>
        // )

        <svg width="32px" height="32px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M1.5 0.5V0C1.22386 0 1 0.223858 1 0.5H1.5ZM1.5 13.5H1C1 13.7761 1.22386 14 1.5 14V13.5ZM4 0V15H5V0H4ZM1.5 1H11.5V0H1.5V1ZM13 2.5V11.5H14V2.5H13ZM11.5 13H1.5V14H11.5V13ZM2 13.5V0.5H1V13.5H2ZM13 11.5C13 12.3284 12.3284 13 11.5 13V14C12.8807 14 14 12.8807 14 11.5H13ZM11.5 1C12.3284 1 13 1.67157 13 2.5H14C14 1.11929 12.8807 0 11.5 0V1ZM7 5H11V4H7V5Z" fill="currentColor" />
        </svg>

    )

}

export default NavigationBooking
