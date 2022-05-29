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
// forecast dta from api
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
const setCitiesInLS = function (cityName) {
  // cities
  const cities = JSON.parse(localStorage.getItem("recentCities")) ?? [];

  // err city does not exist
  if (!cities.includes(cityName)) {
    // input cityName in cities
    cities.push(cityName);
    //
    localStorage.setItem("recentCities", JSON.stringify(cities));
  }
};

const renderCurrentWeatherCard = function (currentData) {
  const currentWeatherCard = `<div class="card-body bg-white border mb-2">
      <h2 class="card-title">
          ${currentData.name} ${currentData.date}
          <img src="https://openweathermap.org/img/w/${
            currentData.iconCode
          }.png" />
      </h2>
      <p class="card-text">Temp: ${currentData.temperature}&deg;F</p>
      <p class="card-text">Wind: ${currentData.wind} MPH</p>
      <p class="card-text">Humidity: ${currentData.humidity}%</p>
      <p class="card-text">
        UV index: <span class="btn ${collectUVIClassName(currentData.uvi)}">${
    currentData.uvi
  }</span>
      </p>
      </div>`;

  weatherCardsContainer.append(currentWeatherCard);
};

//  forecast cards
const renderForecastWeatherCards = function (forecastData) {
  const constructForecastCard = function (each) {
    return `<div class="card m-1 forecast-card">
          <div class="card-body">
          <h5 class="card-title">${each.date}</h5>
          <p class="card-text">
              <img src="https://openweathermap.org/img/w/${each.iconCode}.png" />
          </p>
          <p class="card-text">Temp: ${each.temperature}&deg;F</p>
          <p class="card-text">Wind: ${each.wind} MPH</p>
          <p class="card-text">Humidity: ${each.humidity}</p>
          </div>
      </div>`;
  };

  const forecastCards = forecastData.map(constructForecastCard).join("");

  const forecastCardsContainer = `<div class="bg-white border">
      <h3 class="p-3 text-center">5-Day Forecast:</h3>
      <div
          class="m-3 d-flex flex-wrap justify-content-around"
          id=""
      >${forecastCards}</div>
      </div>`;

  weatherCardsContainer.append(forecastCardsContainer);
};

//  weather cards
const renderWeatherCards = function (weatherData) {
  renderCurrentWeatherCard(weatherData.current);

  renderForecastWeatherCards(weatherData.forecast);
};

const renderRecentCities = function () {
  // getting cities localstorage
  const cities = JSON.parse(localStorage.getItem("recentCities")) ?? [];

  const citiesContainer = $("#city-list");

  citiesContainer.empty();

  const constructAndAppendCity = function (city) {
    const liEl = `<li data-city=${city} class="list-group-item">${city}</li>`;
    citiesContainer.append(liEl);
  };
  const handleClick = function (event) {
    const target = $(event.target);
    //
    if (target.is("li")) {
      // city name
      const cityName = target.data("city");
      // render with city&weather info
      renderWeatherInfo(cityName);
    }
  };

  citiesContainer.on("click", handleClick);

  cities.forEach(constructAndAppendCity);
};

const renderWeatherInfo = async function (cityName) {
  const weatherData = await collectWeatherData(cityName);

  weatherCardsContainer.empty();

  renderWeatherCards(weatherData);
};

const handleSearch = async function (event) {
  event.preventDefault();

  const cityName = $("#city-input").val();

  if (cityName) {
    renderWeatherInfo(cityName);

    setCitiesInLS(cityName);

    renderRecentCities();
  }
};

const handleReady = function () {
  // render recent cities
  renderRecentCities();

  // cities
  const cities = JSON.parse(localStorage.getItem("recentCities")) ?? [];

  // if there are recent cities get the info for the most recent city
  if (cities.length) {
    const cityName = cities[cities.length - 1];
    renderWeatherInfo(cityName);
  }
};

$("#search-form").on("submit", handleSearch);
$(document).ready(handleReady);
