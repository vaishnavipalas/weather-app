const searchInput = document.querySelector(".search-input");
const currWeatherDiv = document.querySelector(".current-weather");
const additionalInfoDiv = document.querySelector(".additional-info");
const hourlyWeatherDiv = document.querySelector(".hourly-weather .weather-list");
const locationButton = document.querySelector(".location-button");

// api key
const API_KEY = "cd90207a89684fdb94522535242112";

// weather condition codes to icons
const weatherCodes = {
    clear: [1000],
    clouds: [1003, 1006, 1009],
    mist: [1030, 1135, 1147],
    rain: [1063, 1150, 1153, 1168, 1171, 1180, 1183, 1198, 1201, 1240, 1243, 1246, 1273, 1276],
    moderate_heavy_rain: [1186, 1189, 1192, 1195, 1243, 1246],
    snow: [1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282],
    thunder: [1087, 1279, 1282],
    thunder_rain: [1273, 1276],
};

// hourly forecast for the next 24 hours
const displayHourlyForecast = (hourlyData) => {
    const currentHour = new Date().setMinutes(0, 0, 0);
    const next24Hours = currentHour + 24 * 60 * 60 * 1000;

    // filter data for the next 24 hours
    const next24HoursData = hourlyData.filter(({ time }) => {
        const forecastTime = new Date(time).getTime();
        return forecastTime >= currentHour && forecastTime <= next24Hours;
    });

    // create hourly forecast list items
    hourlyWeatherDiv.innerHTML = next24HoursData.map((item) => {
        const temp = Math.floor(item.temp_f);
        const forecastTime = new Date(item.time);
        let hours = forecastTime.getHours();
        let minutes = forecastTime.getMinutes();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const time = `${hours}:00 ${ampm}`;
        const weatherIcon = Object.keys(weatherCodes).find((icon) =>
            weatherCodes[icon].includes(item.condition.code)
        );

        return `<li class="weather-item">
                    <p class="time">${time}</p>
                    <img src="../images/${weatherIcon}.svg" class="weather-icon">
                    <p class="temperature">${temp}°</p>
                </li>`;
    }).join("");
};


// fetch weather details and update the UI
const getWeatherDetails = async (API_URL) => {
    window.innerWidth <= 768 && searchInput.blur();
    document.body.classList.remove("show-no-results");

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        console.log(data);

        // display current weather
        const temp = Math.floor(data.current.temp_f);
        const descrip = data.current.condition.text;
        const windMph = Math.floor(data.current.wind_mph);
        const precipIn = Math.floor(data.current.precip_in);

        const weatherIcon = Object.keys(weatherCodes).find((icon) =>
            weatherCodes[icon].includes(data.current.condition.code)
        );

        currWeatherDiv.querySelector(".temperature").innerHTML = `${temp}<span>°F</span>`;
        currWeatherDiv.querySelector(".description").innerHTML = descrip;
        currWeatherDiv.querySelector(".weather-icon").src = `../images/${weatherIcon}.svg`;

        additionalInfoDiv.querySelector(".wind").innerHTML = `${windMph} mph`;
        additionalInfoDiv.querySelector(".precipitation").innerHTML = `${precipIn} in`;

        // combine and display hourly forecast
        const combinedHourlyData = [
            ...data.forecast.forecastday[0].hour,
            ...data.forecast.forecastday[1].hour,
        ];
        displayHourlyForecast(combinedHourlyData);

         // set search input value to the location name
        searchInput.value = data.location.name;
    } catch (error) {
        document.body.classList.add("show-no-results");
    }
};

// prepare and send weather API request
const setUpWeatherRequest = (cityName) => {
    const API_URL = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=2`;
    getWeatherDetails(API_URL);
};

// event listeners for user input and location button
searchInput.addEventListener("keyup", (event) => {
    const cityName = searchInput.value.trim();
    if (event.key == "Enter" && cityName) {
        setUpWeatherRequest(cityName);
    }
});

locationButton.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const API_URL = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=2`;
            getWeatherDetails(API_URL);
        },
        (error) => {
            alert(
                "Location access is blocked. Please allow permissions to use this feature."
            );
        }
    );
});

// default weather request for New York
setUpWeatherRequest("new-york");