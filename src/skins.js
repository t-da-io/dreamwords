

import {getNumDaysWon} from "./historyHelper.js";

export const getKeycapClassName = (_keycap) => {
    var className = "keyboardKey";

    if (_keycap === "NONE") className = "unlockable-64528-keyboardCap";
    else if (_keycap === "GRAD") className = "unlockable-98642-keyboardCap";
    else if (_keycap === "STRIPE") className = "unlockable-125467-keyboardCap";
    else if (_keycap === "DOTS") className = "unlockable-45218-keyboardCap";
    else if (_keycap === "CAT") className = "unlockable-333875-keyboardCap";
    else if (_keycap === "DIAMONDS") className =  "unlockable-777765-keyboardCap";
    else if (_keycap === "GRID") className =  "unlockable-689125-keyboardCap";
    else if (_keycap === "BOLT") className = "unlockable-2244221-keyboardCap";
    else if (_keycap === "EYES") className = "unlockable-766423-keyboardCap";
    else if (_keycap === "LITERAL") className =  "unlockable-223388-keyboardCap";
    else if (_keycap === "HEART") className = "unlockable-444678-keyboardCap"
    else if (_keycap === "GOLD") className = "unlockable-5474865-keyboardCap";;

    return className;
}


export const getKeycapUnlockProgress = (_keycap, _history) => {
    
    var unlockProgress = 1;

    var unlockRequirement = getKeycapUnlockRequirement(_keycap, _history);


    if (unlockRequirement === 0)
        unlockProgress = 1;
    else
        unlockProgress = getNumDaysWon(_history) / unlockRequirement;
    



    return unlockProgress;
}



export const getKeycapUnlockRequirement = (_keycap, _history) => {


    var unlockRequirement = 0;

    if (_keycap === "NONE") unlockRequirement = 0;
    else if (_keycap === "GRAD")  unlockRequirement = 0;
    else if (_keycap === "STRIPE") unlockRequirement = 0;
    else if (_keycap === "DOTS") unlockRequirement = 3;
    else if (_keycap === "CAT") unlockRequirement = 10;
    else if (_keycap === "DIAMONDS") unlockRequirement =  15;
    else if (_keycap === "GRID") unlockRequirement = 20;
    else if (_keycap === "BOLT") unlockRequirement =  25;
    else if (_keycap === "EYES") unlockRequirement = 40;
    else if (_keycap === "LITERAL") unlockRequirement =  50;
    else if (_keycap === "HEART") unlockRequirement = 52;
    else if (_keycap === "GOLD") unlockRequirement = 100;

    return unlockRequirement;
}

export const getKeycapUnlockCurrent = (_keycap, _history) => {
    var unlockCurrent = 0;

    if (_keycap === "NONE" || _keycap === "GRAD" || _keycap === "STRIPE" ||
    _keycap === "DOTS" || _keycap === "CAT" || _keycap === "DIAMONDS" || 
    _keycap === "GRID" || _keycap === "BOLT" || _keycap === "EYES" ||  
    _keycap === "LITERAL" || _keycap === "HEART" || _keycap === "GOLD")
    unlockCurrent = getNumDaysWon(_history);

    return unlockCurrent;
}
