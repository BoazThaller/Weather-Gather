const cheerio = require('cheerio');

export default function Cheerio(html:any) {
    const $ = cheerio.load(html);
    const humidityAndWindDiv = $('.current-weather-details > .left > div ');
    let humidityAndWindData = $(humidityAndWindDiv).find('div').text().split(" ");
    let wind;
    for(let i=0; i<humidityAndWindData.length; i++) {
        console.log(humidityAndWindData[i])
        if(humidityAndWindData[i] == "km/hWind") {
            wind = humidityAndWindData[(i-1)]; 
        }
    }
    let humidity = humidityAndWindData.filter((v: string) => v.startsWith("km/hH"))[0].split("y")[1].split("%")[0];
    const temperatureDiv = $('.temp');
    let temp = $(temperatureDiv).find('div').text().split("\n")[0];

    const cityDiv = $('.header-city-link');
    let cityName = $(cityDiv).find('h1').text().split(",")[0]

    const iconDiv = $('.current-weather-info'); 
    let weatherIcon = $(iconDiv).find('img').attr('src');

    let dataObj = {temp, img: weatherIcon, cityName, wind, humidity };
    return dataObj;

}