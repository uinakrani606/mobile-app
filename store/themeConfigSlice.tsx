import { createSlice } from '@reduxjs/toolkit';
import themeConfig from '../theme.config';

const initialState = {
    isDarkMode: false,
    sidebar: false,
    openHelp: false,
    addEditEvent: false,
    managerSidebar: false,
    managerView: 'manager',
    NavigationView: 'calendar',
    userProfileView: false,
    addEvent: false,
    theme: themeConfig.theme,
    menu: themeConfig.menu,
    layout: themeConfig.layout,
    rtlClass: themeConfig.rtlClass,
    animation: themeConfig.animation,
    navbar: themeConfig.navbar,
    locale: themeConfig.locale,
    semidark: themeConfig.semidark,
    languageList: [
        { code: 'zh', name: 'Chinese' },
        { code: 'da', name: 'Danish' },
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'el', name: 'Greek' },
        { code: 'hu', name: 'Hungarian' },
        { code: 'it', name: 'Italian' },
        { code: 'ja', name: 'Japanese' },
        { code: 'pl', name: 'Polish' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'es', name: 'Spanish' },
        { code: 'sv', name: 'Swedish' },
        { code: 'tr', name: 'Turkish' },
        { code: 'ae', name: 'Arabic' },
    ],
    userLogin: {
        first_name: '',
        last_name: '',
        email: '',
        active: '',
        profile_pic: '',
        telephone: '',
        city: '',
        tours: [],
        languages: [],
        user_id: null,
        password: '',
        role: 'guide'
    },
    userAuth: ''
};

const themeConfigSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        toggleTheme(state, { payload }) {
            payload = payload || state.theme; // light | dark | system
            localStorage.setItem('theme', payload);
            state.theme = payload;
            if (payload === 'light') {
                state.isDarkMode = false;
            } else if (payload === 'dark') {
                state.isDarkMode = true;
            } else if (payload === 'system') {
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    state.isDarkMode = true;
                } else {
                    state.isDarkMode = false;
                }
            }
            if (state.isDarkMode) {
                document.querySelector('body')?.classList.add('dark');
            } else {
                document.querySelector('body')?.classList.remove('dark');
            }
        },
        toggleMenu(state, { payload }) {
            payload = payload || state.menu; // vertical, collapsible-vertical, horizontal
            state.sidebar = false;  // reset sidebar state
            localStorage.setItem('menu', payload);
            state.menu = payload;
        },
        toggleLayout(state, { payload }) {
            payload = payload || state.layout; // full, boxed-layout
            localStorage.setItem('layout', payload);
            state.layout = payload;
        },
        toggleRTL(state, { payload }) {
            payload = payload || state.rtlClass; // rtl, ltr
            localStorage.setItem('rtlClass', payload);
            state.rtlClass = payload;
            document.querySelector('html')?.setAttribute('dir', state.rtlClass || 'ltr');
        },
        toggleAnimation(state, { payload }) {
            payload = payload || state.animation; // animate__fadeIn, animate__fadeInDown, animate__fadeInUp, animate__fadeInLeft, animate__fadeInRight, animate__slideInDown, animate__slideInLeft, animate__slideInRight, animate__zoomIn
            payload = payload?.trim();
            localStorage.setItem('animation', payload);
            state.animation = payload;
        },
        toggleNavbar(state, { payload }) {
            payload = payload || state.navbar; // navbar-sticky, navbar-floating, navbar-static
            localStorage.setItem('navbar', payload);
            state.navbar = payload;
        },
        toggleSemidark(state, { payload }) {
            payload = payload === true || payload === 'true' ? true : false;
            localStorage.setItem('semidark', payload);
            state.semidark = payload;
        },
        toggleLocale(state, { payload }) {
            payload = payload || state.locale;
            localStorage.setItem('i18nextLng', payload);
            state.locale = payload;
        },
        toggleSidebar(state) {
            state.sidebar = !state.sidebar;
        },
        toggleOpenHelp(state) {
            state.openHelp = !state.openHelp;
        },
        toggleAddEditEvent(state) {
            state.addEditEvent = !state.addEditEvent;
        },
        toggleAddEvent(state) {
            state.addEvent = !state.addEvent;
        },
        toggleManagerSidebar(state) {
            state.managerSidebar = !state.managerSidebar;
        },
        toggleManagerView(state, { payload }) {
            state.managerView = payload;
        },
        toggleNavigationView(state, { payload }) {
            state.NavigationView = payload;
        },
        hideUserProfileView(state, { payload }) {
            state.userProfileView = payload;
        },
        setPageTitle(state, { payload }) {
            document.title = `${payload} | Venture by Babylon Tours`;
        },
        toggleUser(state, { payload }) {
            payload = payload || state.userLogin;
            localStorage.setItem('user', JSON.stringify(payload));
            state.userLogin = payload;
        },
        toggleAuth(state, { payload }) {
            payload = payload || state.userAuth;
            localStorage.setItem('authToken', payload);
            state.userAuth = payload;
        },
    },
});

export const { toggleTheme, toggleMenu, toggleManagerSidebar, toggleOpenHelp, toggleAddEvent, toggleAddEditEvent, toggleNavigationView, toggleManagerView, hideUserProfileView, toggleLayout, toggleRTL, toggleAnimation, toggleNavbar, toggleSemidark, toggleLocale, toggleSidebar, setPageTitle, toggleUser, toggleAuth } = themeConfigSlice.actions;

export default themeConfigSlice.reducer;
