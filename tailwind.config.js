import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            // ISU school colors (from the logo) — use these tokens instead
            // of hardcoding hex values in components.
            colors: {
                primary: {
                    DEFAULT: '#14653A',
                    dark: '#0B4A2A',
                    light: '#1E8449',
                },
                accent: '#F4C20D',
                flame: '#D32F2F',
            },
        },
    },

    plugins: [forms],
};
