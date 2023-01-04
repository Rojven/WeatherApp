import { getWeather } from './weather';

import './style.css';
import { ICON_MAP } from './iconMap';

interface ICurrentWeather {
    currentTemp: string;
    highTemp: string;
    lowTemp: string;
    highFL: string;
    lowFL: string;
    windSpeed: string;
    precip: string;
    iconCode: string;
}

const currentIcon = document.querySelector('[data-current-icon]') as HTMLImageElement;
const dailySection = document.querySelector('[data-day-section]');
const dayCardTemplate = document.getElementById('day-card-template') as HTMLTemplateElement;
const hourlySection = document.querySelector('[data-hour-section]');
const hourRowTemplate = document.getElementById('hour-row-template') as HTMLTemplateElement;

const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: 'long' });
const HOUR_FORMATTER = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: 'numeric' });

const setValue = (selector: string, value: string, { parent = document } = {}) => {
    parent.querySelector(`[data-${selector}]`)!.textContent = value;
};

const getIconUrl = (iconCode: number) => {
    return `icons/${ICON_MAP.get(iconCode)}.svg`;
};

const renderCurrentWeather = (current: any) => {
    currentIcon.src = getIconUrl(current.iconCode);
    setValue('current-temp', current.currentTemp);
    setValue('current-high', current.highTemp);
    setValue('current-low', current.lowTemp);
    setValue('current-fl-high', current.highFL);
    setValue('current-fl-low', current.lowFL);
    setValue('current-wind', current.windSpeed);
    setValue('current-precip', current.precip);
};

const renderDailyWeather = (daily: any) => {
    dailySection!.innerHTML = '';
    daily.forEach((day: any) => {
        const elem = dayCardTemplate.content.cloneNode(true) as Document;
        setValue('temp', day.maxTemp, { parent: elem });
        setValue('date', DAY_FORMATTER.format(day.timestamp), { parent: elem });
        const dayIcon = elem.querySelector('[data-icon]') as HTMLImageElement;
        dayIcon.src = getIconUrl(day.iconCode);
        dailySection?.append(elem);
    });
};

const renderHourlyWeather = (hourly: any) => {
    hourlySection!.innerHTML = '';
    hourly.forEach((hour: any) => {
        const elem = hourRowTemplate.content.cloneNode(true) as Document;
        setValue('temp', hour.temp, { parent: elem });
        setValue('fl-temp', hour.FLTemp, { parent: elem });
        setValue('wind', hour.windSpeed, { parent: elem });
        setValue('precip', hour.precip, { parent: elem });
        setValue('day', DAY_FORMATTER.format(hour.timestamp), { parent: elem });
        setValue('time', HOUR_FORMATTER.format(hour.timestamp), { parent: elem });
        const dayIcon = elem.querySelector('[data-icon]') as HTMLImageElement;
        dayIcon.src = getIconUrl(hour.iconCode);
        hourlySection?.append(elem);
    });
};

const renderWeather = ({ current, daily, hourly }: any) => {
    renderCurrentWeather(current);
    renderDailyWeather(daily);
    renderHourlyWeather(hourly);
}

const positionSuccess = ({ coords }: any) => {
    getWeather(coords.latitude, coords.longitude, Intl.DateTimeFormat().resolvedOptions().timeZone)
        .then(renderWeather)
        .catch(e => {
            console.error(e);
            alert("Error getting weather");
        })
}

const positionError = () => {
    alert("There was an error getting your location. Please allow us to use your location and refresh the page.");
}

navigator.geolocation.getCurrentPosition(positionSuccess, positionError);