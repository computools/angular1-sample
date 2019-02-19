'use strict';
App.factory('constants',
    function () {
        return {
            PATTERN: {
                PASSWORD_PATTERN: /^[a-z0-9~!?@#$%^&*()_|+=]{6,65}$/i,
                MAIL_PATTERN: /^[a-z0-9-_.]+@[a-z0-9-.]+\.[a-z]{0,65}$/i,
                FIRST_LAST_NAME_PATTERN: /^[a-z]{2,65}$/i,
                DOMAIN_PATTERN: /^[a-z 0-9-]{1,265}$/i,
                NAME_COMPANY: /^[a-z0-9 ~!?@#$%^&*()_|+=.]{2,65}$/i,
                DOMAIN: /[^A-Za-z0-9-]/g,
                ADDRESS_PATTERN: /^[a-z 0-9,.-_/\s=]{2,65}$/i,
                ZIP_CODE: /^[0-9-]{4,15}$/i,
                CITY_NAME: /^[a-z]{2,65}$/i,
                WEBSITE: /^[a-z.-_/]{3,65}$/i,
                MOBILE: /^[0-9-]{9,21}$/,
                SKYPE: /^[a-z.]{6,32}$/i,
            },
            TEXT: {
                COUNTRY_VALUE: 'I\'m from...',
                AUTO_PUBLISH_FALSE: "Auto-publish can't be activated",
                AUTO_PUBLISH_TRUE_DEACTIVE: "Auto-publishing deactivated.",
                AUTO_PUBLISH_FALSE_DEACTIVE: "Auto-publishing can't be deactivated",

                LAST_DAY: 'last Day',
                LAST_7_DAY: 'last 7 Day',
                LAST_15_DAY: 'last 15 Day',
                LAST_30_DAY: 'last 30 Day',
                LAST_60_DAY: 'last 60 Day',
                LAST_90_DAY: 'last 90 Day',
                LAST_180_DAY: 'last 180 Day',
                LAST_365_DAY: 'last 365 Day',
                ALL_TIME: 'all time',

            },
            MAGIC_NUMBERS: {
                NUMBERS_100: 100,
                NUMBERS_1000: 1000,
                NUMBERS_1024: 1024,
                NUMBERS_3600: 3600,
                NUMBERS_60000: 60000,
                NUMBERS_DAY: 8600000,
                NUMBERS_7_DAY: 604800000,
                NUMBERS_15_DAY: 1296000000,
                NUMBERS_30_DAY: 2592000000,
                NUMBERS_60_DAY: 5184000000,
                NUMBERS_90_DAY: 7776000000,
                NUMBERS_180_DAY: 15552000000,
                NUMBERS_365_DAY: 31104000000,

            }
        }
    }
);