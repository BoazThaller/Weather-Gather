import React, { ChangeEvent, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { ActionType } from '../../redux/ActionType';
import { AppState } from '../../redux/AppState';
import FadeIn from 'react-fade-in';
import $ from "jquery";

const axios = require('axios');
const cheerio = require('cheerio');

export default function Navbar() {
    const [visible, setVisible] = useState(false);

    let constantUrl = "https://www.accuweather.com/"
    let url = "https://www.accuweather.com/en/search-locations?query=";
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
        if (!/^[A-Z]+$/i.test(key)) {
            e.preventDefault();
        }
    })

    const getSearchLink = async () => {
        return fetchData(url + userSearch).then((res) => {
            const html = res.data;
            const $ = cheerio.load(html);
            const noResult = $(".content-module")
            let noResultsFound = $(noResult).find("div").text().split(".");
            let split = noResultsFound[0];
            if(split.toLowerCase() == "no results found") {
                return;
            }
            const href = $(".locations-list");
            let firstSearchedResultLink = $(href).find("a")[0].attribs.href;
            let forecastLink = constantUrl + firstSearchedResultLink;
            return fetchData(forecastLink).then((res) => {
                const html = res.data;
                const $ = cheerio.load(html);
                const href = $("link").attr("href")
                return href.replace("weather-forecast", "current-weather")
            })
        })
    }

// on click function to initialize location search 
    const onSearchClicked = async () => {
            let searchInput = $("#search-input");
            if(userSearch.trim() == "") {
                alert("Cannot leave that field empty");
                return;
            }
            setVisible(true);
            getSearchLink().then((url) => {
                if(url == undefined) {
                    setVisible(false);
                    alert("No location found");
                    $("#search-input").val("");
                    return;
                }
                fetchData(url).then((res) => {
                    const html = res.data;
                    const $ = cheerio.load(html);
                    const humidityAndWind = $('.current-weather-details > .left > div ');
                    const temperature = $('.temp');
                    const city = $('.header-city-link');
                    const icon = $('.current-weather-info');
                    
                    let temp = $(temperature).find('div').text();
                    let tempRefined = temp.split('\n');
                    tempRefined = tempRefined[0];
        
                    let img = $(icon).find('img').attr('src');
        
                    let cityName = $(city).find('h1').text();
                    let cityNameRefined = cityName.split(',')
                    let userSearchCap = userSearch.charAt(0).toUpperCase() + userSearch.slice(1)
                    if(userSearchCap != cityNameRefined[0]) {
                        setVisible(false);
                        alert("No location found");
                        searchInput.val("");
                        return;
                    }
                    let humidityAndWindData = $(humidityAndWind).find('div').text();
                    console.log(humidityAndWindData);
                    let humidityAndWindDataRefined = humidityAndWindData.split(' ');
                    console.log(humidityAndWindDataRefined);
        
                    // let wind = humidityAndWindDataRefined.filter((v: string) => v.startsWith("Wind"))
        
                    let humidity = humidityAndWindDataRefined.filter((v: string) => v.startsWith("km/hH"));
                    let humidityRefined = humidity[0].split("y")[1];
                    humidityRefined = humidityRefined.split("%")[0];
        
                    let dataObj = {tempRefined, img, cityNameRefined, humidityAndWindDataRefined, humidityRefined }
    
                    // sending the refined data as an object to AppState via dispatch
                    dispatch({type: ActionType.getData, payload: dataObj});
                    setVisible(false);
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
            <FadeIn>
                    <h1>Weather Gather</h1>
                    <div className="searchDiv">
                        <input id="search-input" className="searchInput" type="text" placeholder="Search location" onChange={onSearchChanged}/>
                        <button className="searchBtn" onClick={onSearchClicked}>Search</button>
                    </div>
                    <div id="container" className="locationsContainer">
                        {userLocation.map((data:any, key:number) => (
                            <div key={key} className="locationCard">  
                                <FadeIn key={key} delay={300} transitionDuration={450}>
                                    <div className="cityContainer"><strong>Location:</strong> {data.cityNameRefined[0]}</div>
                                    <div className="tempContainer"> <strong> Temperature: </strong> {data.tempRefined}</div>
                                    <div className="windContainer"> <span className="windLeft"><strong> Wind: </strong></span> <span className="windRight">{data.humidityAndWindDataRefined[5]}Kmh</span></div>
                                    <div className="humidityContainer"><strong>Humidity:</strong>{data.humidityRefined} </div>
                                    <img src={data.img} alt="weatherIcon"/>
                                </FadeIn>
                            </div>
                        ))} 
                    </div>
            </FadeIn>
            {visible && <div id="loader" className="loader"></div>}

        </div>
    )
}

 
