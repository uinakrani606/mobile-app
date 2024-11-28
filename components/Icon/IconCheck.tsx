import { FC } from 'react';

interface IconCheckProps {
    className?: string;
}

const IconCheck: FC<IconCheckProps> = ({ className }) => {
    return (
        <svg width="20" height="20" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M1 6.9L4.14286 10.5L12 1.5" stroke="#FFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

    );
};

export default IconCheck;
