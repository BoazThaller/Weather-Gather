import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { ActionType } from '../../redux/ActionType';
import { AppState } from '../../redux/AppState';
import Cheerio from "../cheerio/Cheerio"
import FadeIn from 'react-fade-in';
import $ from "jquery";

const axios = require('axios');
const cheerio = require('cheerio');

export default function FetchData() {
    const [loaderVisible, toggleLoader] = useState(false);

    const url = useSelector((state: AppState) => state.currentUrls);

    const dispatch = useDispatch();
    const locationsArray = useSelector((state: AppState) => state.locationData);

    // on init function to render weather cards to UI
    useEffect(() => {
            $("#mainContainer").empty();
            toggleLoader(true);
            for(let i=0; i<url.length; i++) {
                fetchData(url[i]).then((response) => {
                    const html = response.data;
                    let dataObj = Cheerio(html);
                    // sending the refined data as an object to AppState via dispatch
                    dispatch({type: ActionType.getData, payload: dataObj});
                    toggleLoader(false);
                })
            }
    }, [dispatch]);

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
                    <FadeIn delay={500} transitionDuration={500}>
                        <div key={key} className="locationCard">  
                            <FadeIn key={key} delay={300} transitionDuration={450}>
                                <div className="cityContainer"><strong>Location:</strong> {data.cityName}</div>
                                <div className="tempContainer"> <strong> Temperature: </strong> {data.temp}</div>
                                <div className="windContainer"> <span className="windLeft"><strong> Wind: </strong></span> <span className="windRight">{data.wind}Kmh</span></div>
                                <div className="humidityContainer"><strong>Humidity:</strong>{data.humidity}% </div>
                                <img src={data.img} alt="weatherIcon"/>
                            </FadeIn>
                        </div>
                     </FadeIn>
                ))} 

                {loaderVisible && <div className="loader"></div>}
        </div>
    )
}
