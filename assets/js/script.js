const weatherCardsContainer = $("#weather-cards-container");

// Open weather API
const API_KEY = "60687e3c50614663696f05b189c2493e";

// collect data from API
const collectCurrentData = function (name, forecastData) {
  return {
    name: name,
    temperature: forecastData.current.temp,
    wind: forecastData.current.wind_speed,
    humidity: forecastData.current.humidity,
    uvi: forecastData.current.uvi,
    date: collectFormattedDate(forecastData.current.dt, "ddd DD/MM/YYYY HH:mm"),
    iconCode: forecastData.current.weather[0].icon,
  };
};

const collectFormattedDate = function (unixTimestamp, format = "DD/MM/YYYY") {
  return moment.unix(unixTimestamp).format(format);
};
// Get forecast data from API
const collectForecastData = function (forecastData) {
  const callback = function (each) {
    return {
      date: collectFormattedDate(each.dt),
      temperature: each.temp.max,
      wind: each.wind_speed,
      humidity: each.humidity,
      iconCode: each.weather[0].icon,
    };
  };

  return forecastData.daily.slice(1, 6).map(callback);
};

const collectWeatherData = async (cityName) => {
  const currentDataUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`;
  const currentDataResponse = await fetch(currentDataUrl);
  const currentData = await currentDataResponse.json();

  const lat = currentData.coord.lat;
  const lon = currentData.coord.lon;
  const name = currentData.name;

  const forecastDataUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;

  const forecastDataResponse = await fetch(forecastDataUrl);
  const forecastData = await forecastDataResponse.json();

  const current = collectCurrentData(name, forecastData);
  const forecast = collectForecastData(forecastData);

  return {
    current: current,
    forecast: forecast,
  };
};

const collectUVIClassName = function (uvi) {
  if (uvi >= 0 && uvi < 3) {
    return "btn-success";
  } else if (uvi >= 3 && uvi < 6) {
    return "btn-warning";
  } else if (uvi >= 6 && uvi < 8) {
    return "btn-danger";
  } else {
    return "btn-dark";
  }
};
