import React, { ChangeEvent, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { ActionType } from '../../redux/ActionType';
import { AppState } from '../../redux/AppState';
import FadeIn from 'react-fade-in';
import $ from "jquery";

const axios = require('axios');
const cheerio = require('cheerio');

export default function Navbar() {
    const [loaderVisible, toggleLoader] = useState(false);

    let urlPrefix = "https://www.accuweather.com/"
    let searchUrlBase = urlPrefix + "/en/search-locations?query=";
    const dispatch = useDispatch();
    let [userSearch, setUserSearch] = useState("");
    const userLocation = useSelector((state: AppState) => state.userLocationSearch);

    // listener to input changes
    const onSearchChanged = (event: ChangeEvent<HTMLInputElement>) => {
        setUserSearch(event.target.value);
    }

    // prevents false input
    $('#search-input').on('keypress', function (e) {
        let key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (!/^[A-Z ]+$/i.test(key)) {
            e.preventDefault();
        }
    })

    // generates a search url for a specific location
    const getSearchUrl = async () => {
        return fetchData(searchUrlBase + userSearch).then((response) => {
            const html = response.data;
            const $ = cheerio.load(html);
            const noResult = $(".content-module")
            let noResultsFound = $(noResult).find("div").text().split(".")[0];
            if(noResultsFound.toLowerCase() == "no results found") {
                return;
            }
            const locationsListDiv = $(".locations-list");
            // extracts the first url from the locations list that matches the search term
            if(locationsListDiv.length > 0) {
                let firstSearchedResultLink = $(locationsListDiv).find("a")[0].attribs.href;
                let forecastLink = urlPrefix + firstSearchedResultLink;
                return fetchData(forecastLink).then((response) => {
                    const html = response.data;
                    const $ = cheerio.load(html);
                    const url = $("link").attr("href");
                    return url.replace("weather-forecast", "current-weather");
                })
            }
            else {
                const url = $("link").attr("href");
                return url.replace("weather-forecast", "current-weather");
            }
        })
    }

    // callback function to initialize location search 
    const onSearchClicked = async () => {
            let searchInput = $("#search-input");
            if(userSearch.trim() == "") {
                alert("Please enter search term");
                return;
            };
            toggleLoader(true);
            getSearchUrl().then((searchUrl) => {
                if(searchUrl == undefined) {
                    toggleLoader(false);
                    alert("No location found");
                    $("#search-input").val("");
                    return;
                }
                fetchData(searchUrl).then((response) => {
                    const html = response.data;
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
                    let humidity = humidityAndWindData.filter((v: string) => v.startsWith("km/hH"))[0].split("y")[1].split("%")[0]

                    const temperatureDiv = $('.temp');
                    let temp = $(temperatureDiv).find('div').text().split("\n")[0];

                    const cityDiv = $('.header-city-link');
                    let cityName = $(cityDiv).find('h1').text().split(",")[0]
                    let userSearchCap = userSearch.toUpperCase()
                    if(userSearchCap != cityName.toUpperCase()) {
                        toggleLoader(false);
                        alert("No location found");
                        searchInput.val("");
                        return;
                    }

                    const iconDiv = $('.current-weather-info'); 
                    let weatherIcon = $(iconDiv).find('img').attr('src');
    
                    let dataObj = {temp, img: weatherIcon, cityName, wind, humidity }
    
                    // sending the refined data as an object to AppState via dispatch
                    dispatch({type: ActionType.getData, payload: dataObj});
                    toggleLoader(false);
                })
    
            })
    }

// function to get the right website to crawl on
    async function fetchData(url:any){
        let response = await axios(url).catch((err:any) => console.log(err));
        if(response.status !== 200){
            return;
        }
        return response;
    }

    return (
        <div>
            <h1>Weather Gather</h1>
            <div className="searchDiv">
                <input id="search-input" className="searchInput" type="text" placeholder="Search location" onChange={onSearchChanged}/>
                <button className="searchBtn" onClick={onSearchClicked}>Search</button>
            </div>
            <div id="container" className="locationsContainer">
                {userLocation.map((data:any, key:number) => (
                    <div key={key} className="locationCard">  
                        <FadeIn key={key} delay={300} transitionDuration={450}>
                            <div className="cityContainer"><strong>Location:</strong> {data.cityName}</div>
                            <div className="tempContainer"> <strong> Temperature: </strong> {data.temp}</div>
                            <div className="windContainer"> <span className="windLeft"><strong> Wind: </strong></span> <span className="windRight">{data.wind}Kmh</span></div>
                            <div className="humidityContainer"><strong>Humidity:</strong>{data.humidity}% </div>
                            <img src={data.img} alt="weatherIcon"/>
                        </FadeIn>
                    </div>
                ))} 
            </div>
            {loaderVisible && <div id="loader" className="loader"></div>}

        </div>
    )
}

 
