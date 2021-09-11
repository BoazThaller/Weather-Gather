import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { ActionType } from '../../redux/ActionType';
import { AppState } from '../../redux/AppState';
import FadeIn from 'react-fade-in';
import $ from "jquery";

const axios = require('axios');
const cheerio = require('cheerio');

export default function FetchData() {
    const [visible, setVisible] = useState(false);

    const url = useSelector((state: AppState) => state.currentUrls);

    const dispatch = useDispatch();
    const locationsArray = useSelector((state: AppState) => state.locationData);

    // on init function to render weather cards to UI
    useEffect(() => {
            $("#mainContainer").empty();
            setVisible(true);
            for(let i=0; i<url.length; i++) {
                fetchData(url[i]).then((res) => {
                    // Using Cheerio library to search a url and extract specific data from there.
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
          
                    let humidityAndWindData = $(humidityAndWind).find('div').text();
                    let humidityAndWindDataRefined = humidityAndWindData.split(' ');

                    let humidity = humidityAndWindDataRefined.filter((v: string) => v.startsWith("km/hH"));
                    let humidityRefined = humidity[0].split("y")[1];
                    humidityRefined = humidityRefined.split("%")[0];

                    let dataObj = {tempRefined, img, cityNameRefined, humidityAndWindDataRefined, humidityRefined }
                    // sending the refined data as an object via dispatch
                    dispatch({type: ActionType.getData, payload: dataObj});
                    setVisible(false);
                })
            }
    }, [dispatch])

// function to get the right website to crawl on
async function fetchData(url:any){
    console.log("Crawling data...")
    let response = await axios(url).catch((err:any) => console.log(err));
    if(response.status !== 200){
        console.log("Error occurred while fetching data");
        return;
    }
    return response;
}

    return (
        <div id="mainContainer" className="locationsContainer">
                {locationsArray.map((data:any, key:number) => (
                    <div  key={key} className="locationCard">  
                        <FadeIn key={key} delay={300} transitionDuration={450}>
                            <div className="cityContainer"><strong>Location:</strong> {data.cityNameRefined[0]}</div>
                            <div className="tempContainer"> <strong> Temperature: </strong>  {data.tempRefined}</div>
                            <div className="windContainer"> <span className="windLeft"><strong> Wind: </strong></span> <span className="windRight">{data.humidityAndWindDataRefined[5]}Kmh</span></div>
                            <div className="humidityContainer"><strong>Humidity:</strong>{data.humidityRefined}% </div>
                            <img className="icon" src={data.img} alt="weatherIcon"/>
                        </FadeIn>
                     </div>
                ))} 

                {visible && <div className="loader"></div>}
        </div>
    )
}
