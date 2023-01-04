import axios from 'axios';

export interface ICurrentWeather {
    current_weather: {
        temperature: number;
        windspeed: number;
        weathercode: string;
    };
    daily: {
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        apparent_temperature_max: number[];
        apparent_temperature_min: number[];
        precipitation_sum: number[];
    };
}

interface IDailyWeather {
    daily: {
        time: number[];
        temperature_2m_max: number[];
        weathercode: number[];
    };
}

interface IHourlyWeather {
    hourly: {
        time: number[];
        temperature_2m: number[];
        weathercode: number[];
        apparent_temperature: number[];
        windspeed_10m: number[];
        precipitation: number[];
    };
    current_weather: {
        time: number;
    }
}

export const getWeather = (lat: number, lon: number, timezone: string) => {
    return axios.get('https://api.open-meteo.com/v1/forecast?hourly=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&timeformat=unixtime', {
        params: {
            latitude: lat,
            longitude: lon,
            timezone: timezone,
        }
    }).then(({ data }) => {
        return {
            current: parseCurrentWeather(data),
            daily: parseDailyWeather(data),
            hourly: parseHourlyWeather(data),
        }
    })
};

const parseCurrentWeather = ({ current_weather, daily }: ICurrentWeather) => {
    const {
        temperature: currentTemp,
        windspeed: windSpeed,
        weathercode: iconCode
    } = current_weather;

    const {
        temperature_2m_max: [maxTemp],
        temperature_2m_min: [minTemp],
        apparent_temperature_max: [maxFL],
        apparent_temperature_min: [minFL],
        precipitation_sum: [precip]
    } = daily;

    return {
        currentTemp: Math.round(currentTemp),
        highTemp: Math.round(maxTemp),
        lowTemp: Math.round(minTemp),
        highFL: Math.round(maxFL),
        lowFL: Math.round(minFL),
        windSpeed: Math.round(windSpeed),
        precip: Math.round(precip * 100) / 100,
        iconCode,
    }
};

const parseDailyWeather = ({ daily }: IDailyWeather) => {
    return daily.time.map((time, i) => {
        return {
            timestamp: time * 1000,
            iconCode: daily.weathercode[i],
            maxTemp: Math.round(daily.temperature_2m_max[i]),
        }
    })
};

const parseHourlyWeather = ({ hourly, current_weather }: IHourlyWeather) => {
    return hourly.time.map((time, i) => {
        return {
            timestamp: time * 1000,
            iconCode: hourly.weathercode[i],
            temp: Math.round(hourly.temperature_2m[i]),
            FLTemp: Math.round(hourly.apparent_temperature[i]),
            windSpeed: Math.round(hourly.windspeed_10m[i]),
            precip: Math.round(hourly.precipitation[i] * 100) / 100,
        }
    }).filter(({ timestamp }) => timestamp >= current_weather.time * 100)
}