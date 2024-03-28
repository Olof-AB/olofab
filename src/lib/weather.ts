import { fetchWeatherApi } from 'openmeteo';
	
export async function getWeather() {
const params = {
	"latitude": 59.8588,
	"longitude": 17.6389,
	"hourly": "temperature_2m",
	"past_days": 7,
	"forecast_days": 1
};
const url = "https://api.open-meteo.com/v1/forecast";
const responses = await fetchWeatherApi(url, params);

// Helper function to form time ranges
const range = (start: number, stop: number, step: number) =>
	Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

// Process first location. Add a for-loop for multiple locations or weather models
const response = responses[0];

// Attributes for timezone and location
const utcOffsetSeconds = response.utcOffsetSeconds();

const hourly = response.hourly()!;

// Note: The order of weather variables in the URL query and the indices below need to match!
const hourlyWeather = {
		time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
			(t) => new Date((t + utcOffsetSeconds) * 1000)
		),
		temperature2m: hourly.variables(0)!.valuesArray()!,
	}

const weatherData = hourlyWeather.time.map((time, index) => ({
  time,
  value: hourlyWeather.temperature2m[index]
}));

// `weatherData` now contains a simple structure with arrays for datetime and weather data
// for (let i = 0; i < weatherData.hourly.time.length; i++) {
// 	console.log(
// 		weatherData.hourly.time[i].toISOString(),
// 		weatherData.hourly.temperature2m[i]
// 	);
// }

  return weatherData;
}
