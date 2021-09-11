import { ActionType } from "./ActionType";
import { Action } from "./Action";
import { AppState } from "./AppState";

// This function is NOT called direcrtly by you
export function Reduce(oldAppState: AppState = new AppState(), action: Action): AppState {
  // Cloning the oldState (creating a copy)
  const newAppState = { ...oldAppState };
  
  switch (action.type) {
    // pushes urls to locationData
    case ActionType.getData:
        let location = action.payload;
        newAppState.locationData.push(location);
        newAppState.locationData = [...newAppState.locationData]
      break; 
    case ActionType.addUrl:
        let url = action.payload;
        newAppState.currentUrls.push(url);
        newAppState.currentUrls = [...newAppState.currentUrls]
      break; 

  }
  return newAppState;
}
