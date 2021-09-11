import { ILocation } from "../interface/ILocation";
import { IUrl } from "../interface/IUrl";

export class AppState{
  public locationData: ILocation[] = [];

  public userLocationSearch: ILocation[] = [];

  public currentUrls: any = [
    "https://www.accuweather.com/en/gb/london/ec4a-2/current-weather/328328",
    "https://www.accuweather.com/en/fr/paris/623/current-weather/623",
    "https://www.accuweather.com/en/es/madrid/308526/current-weather/308526",
    "https://www.accuweather.com/en/es/barcelona/307297/current-weather/307297"
  ];

}
