import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx}',
    ],

    theme: {
        extend: {
            colors: {
                background: '#faf8ff',
                surface: '#faf8ff',
                'surface-container': '#eaedff',
                'surface-container-low': '#f2f3ff',
                'surface-container-lowest': '#ffffff',
                'surface-container-high': '#e2e7ff',
                'surface-container-highest': '#dae2fd',
                'on-surface': '#131b2e',
                'on-surface-variant': '#434653',
                outline: '#747685',
                'outline-variant': '#c4c6d6',
                primary: {
                    DEFAULT: '#00318e',
                    container: '#1247b8',
                    fixed: '#dbe1ff',
                },
                'on-primary': '#ffffff',
                secondary: {
                    DEFAULT: '#964900',
                    container: '#ff8000',
                },
                'on-secondary': '#ffffff',
                tertiary: {
                    DEFAULT: '#00423c',
                    container: '#005b53',
                    fixed: '#89f5e7',
                    'fixed-dim': '#6bd8cb',
                },
            },
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                display: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
            },
            borderRadius: {
                xl: '0.75rem',
            },
        },
    },

    plugins: [forms],
};
