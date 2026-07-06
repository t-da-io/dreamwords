

import './App.css';
import React, { createContext, useEffect, useState } from "react";



import { analytics } from "./firebase";
import {logEvent} from "firebase/analytics";


import Header from "./components/Header.js";
import Game from "./components/Game.js";
import HelpMenu from "./components/ui_components/HelpMenu.js";
import Medals from "./components/ui_components/Medals.js";

import { getHydranoidSpungus, getSprondlemonusTrobian } from './levelData';
import { newDate, newDateYMD, newDateYMDH, newDateYMDHM } from './date';

import { checkGameLost, checkGameWon } from './gameOver';
import UpdateNotification from './components/ui_components/UpdateNotification';

export const AppContext = createContext();





function App() {

  // CONTEXT VARIABLE DECLARATION

  const [gameState, setGameState] = useState("LOADING");
  const [levelData, setLevelData] = useState({
    goalPhrase: "...",
    hiddenWords: "",
    imageCount: "1 2 3 4"
  });
  const [pressedLetters, setPressedLetters] = useState([]);
  const [correctLetters, setCorrectLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);
  const [isLastLetterCorrect, setIsLastLetterCorrect] = useState(-1);
  const [completedWordOrder, setCompletedWordOrder] = useState([]);
  const [completedLevel, setCompletedLevel] = useState(-1);
  const [streak, setStreak] = useState(-1);
  const [superStreak, setSuperStreak] = useState(-1);
  const [superStreakHighScore, setSuperStreakHighScore] = useState(-1);
  const [acceptSelectLetter, setAcceptSelectLetter] = useState(true);
  const [selectedDreamDisplayIndex, setSelectedDreamDisplayIndex] = useState(0);
  const [isDreamDisplayAutoMode, setIsDreamDisplayAutoMode] = useState(true);
  const [gameTitle, setGameTitle] = useState("");
  const [gameURL, setGameURL] = useState("");
  const [versionCode, setVersionCode] = useState("");
  const [levelIndex, setLevelIndex] = useState(-1);
  const [livesCompletedPulse, setLivesCompletedPulse] = useState([-1, -1, -1]);
  const [shareButtonClicked, setShareButtonClicked] = useState(false);
  const [helpMenuShown, setHelpMenuShown] = useState(-1);
  const [medalsShown, setMedalsShown] = useState(0);
  const [newUpdateNotification, setNewUpdateNotification] = useState(-1);
  const [updateNotificationShown, setUpdateNotificationShown] = useState(0);
  const [todayIndex, setTodayIndex] = useState(0);
  const [streakFrozen, setStreakFrozen] = useState(false);

  
  const [history, setHistory] = useState({}); // { "daysPlayed": [0,1,2,3,4,8,9,34,35], "results" : { 0:{"correctLetters":[], "wrongLetters"[]},  1:{"correctLetters":[], "wrongLetters"[]}, ...  } }  
  const [selectedKeycap, setSelectedKeycap] = useState("NONE");



  // CONSTANTS
  const GAME_TITLE = "Daydreams";
  const GAME_URL = "https://daydreams.ai";
  const DEMO_MODE = false;
  const BUILD_MODE = "RELEASE"; // BUILD / RELEASE
  const VERSION_CODE = "1.5";

  const INTERVAL = 0; // 0d1m2h
  const KEY_DELAY_MS = 0;


  // EVENTS

  const onSelectLetter = (keyVal) => {

    keyVal = keyVal.toLowerCase();


    if (gameState !== "RUNNING") return; // ignore key inputs if game is not running
    if (helpMenuShown === 1) return; // ignore key inputs if help menu is shown

    if (pressedLetters.includes(keyVal)) return; // ignore key inputs if letter has been pressed

    if (!acceptSelectLetter) return;

    // adds it to the pressed keys
    setPressedLetters((prev) => [...prev, keyVal]);

    // checks if its wrong or right. Adds it to that
    if (levelData.goalPhrase.toLowerCase().includes(keyVal)) {
      setCorrectLetters((prev) => [...prev, keyVal]);
      setIsLastLetterCorrect(1);
    } else {
      setWrongLetters((prev) => [...prev, keyVal]);
      setIsLastLetterCorrect(0);
    }
  }


  const onSelectKeycap = (_newKeycap) => {
    setSelectedKeycap(_newKeycap);
    storageSave("SAVE_SELECTED_KEYCAP", _newKeycap);
  }


  // HELPER
  
  function storageSave (storageKey, storageNewData) {
    localStorage.setItem(BUILD_MODE +"_"+ storageKey, storageNewData);
  }

  function storageLoad (storageKey) {
    return localStorage.getItem(BUILD_MODE +"_"+ storageKey);
  }

  function newDay (freezeStreak) {
    // and the previous level hasn't been completed yet
    const saveDataPreviousCompletedLevel = storageLoad("SAVE_COMPLETED_LEVEL");
    if (saveDataPreviousCompletedLevel != null && parseInt(saveDataPreviousCompletedLevel) === 0) {

      // reset streak
      if (!DEMO_MODE && !freezeStreak) {
        storageSave("SAVE_STREAK", 0);
        storageSave("SAVE_STREAK_SUPER", 0);
      }
    }

    // clear save data
    storageSave("SAVE_PRESSED_LETTERS", "[]");
    storageSave("SAVE_CORRECT_LETTERS", "[]");
    storageSave("SAVE_WRONG_LETTERS", "[]");
    storageSave("SAVE_COMPLETED_WORD_ORDER", "[]");
    storageSave("SAVE_COMPLETED_LEVEL", 0);
  }




  // ------ INITIALISATION


  let todayTimestampUTC = newDate();

  let todayDayUTC;
  if (INTERVAL === 0) {
        todayDayUTC = new Date(todayTimestampUTC.getFullYear(), todayTimestampUTC.getMonth(), todayTimestampUTC.getDate()); // day refresh
  }
  if (INTERVAL === 1){
        todayDayUTC = new Date(todayTimestampUTC.getFullYear(), todayTimestampUTC.getMonth(), todayTimestampUTC.getDate(), todayTimestampUTC.getHours(), todayTimestampUTC.getMinutes());   // minutes refresh
  }
  if (INTERVAL === 2){
        todayDayUTC = new Date(todayTimestampUTC.getFullYear(), todayTimestampUTC.getMonth(), todayTimestampUTC.getDate(), todayTimestampUTC.getHours());   // hours refresh
  }




  useEffect(() => {





    // Game Properties
    setGameTitle(GAME_TITLE);
    setGameURL(GAME_URL);
    setVersionCode(VERSION_CODE);
    


    // Load Level
    getHydranoidSpungus(todayDayUTC, DEMO_MODE, INTERVAL).then((hybronuSprillabrib) => {
      setLevelIndex(hybronuSprillabrib);
      getSprondlemonusTrobian(hybronuSprillabrib, BUILD_MODE).then((dailyLevelData) => {


        setGameState("RUNNING");
        setLevelData(dailyLevelData);
      }).then(() => {
      
        setTodayIndex(hybronuSprillabrib);

        // Check to see if new day has passed (compare it to the previous save time stamp and update it)
        let previousPageOpenDateUTC = new Date(storageLoad("SAVE_TIMESTAMP_OPEN"));
        if (previousPageOpenDateUTC === null)
          previousPageOpenDateUTC = todayTimestampUTC;

          
        // get a new date with just the DAY
        let previousPageOpenDayUTC = newDate();
        if (INTERVAL === 0)
          previousPageOpenDayUTC = new Date(previousPageOpenDateUTC.getFullYear(), previousPageOpenDateUTC.getMonth(), previousPageOpenDateUTC.getDate()); // day previous
        if (INTERVAL === 1)
          previousPageOpenDayUTC = new Date(previousPageOpenDateUTC.getFullYear(), previousPageOpenDateUTC.getMonth(), previousPageOpenDateUTC.getDate(), previousPageOpenDateUTC.getHours(), previousPageOpenDateUTC.getMinutes()); // minute previous
        if (INTERVAL === 2)
          previousPageOpenDayUTC = new Date(previousPageOpenDateUTC.getFullYear(), previousPageOpenDateUTC.getMonth(), previousPageOpenDateUTC.getDate(), previousPageOpenDateUTC.getHours()); // hour previous


        let oneDayAfterPreviousPageOpenDayUTC = newDate();
        if (INTERVAL === 0)
          oneDayAfterPreviousPageOpenDayUTC = new Date(previousPageOpenDayUTC.getFullYear(), previousPageOpenDayUTC.getMonth(), previousPageOpenDayUTC.getDate() + 1);
        if (INTERVAL === 1)
          oneDayAfterPreviousPageOpenDayUTC = new Date(previousPageOpenDayUTC.getFullYear(), previousPageOpenDayUTC.getMonth(), previousPageOpenDayUTC.getDate(), previousPageOpenDayUTC.getHours(), previousPageOpenDayUTC.getMinutes() + 1);
        if (INTERVAL === 2)
          oneDayAfterPreviousPageOpenDayUTC = new Date(previousPageOpenDayUTC.getFullYear(), previousPageOpenDayUTC.getMonth(), previousPageOpenDayUTC.getDate(), previousPageOpenDayUTC.getHours() +1);


        let newDayArrived = previousPageOpenDayUTC < todayDayUTC;
        let moreThanOneNewDayArrived = oneDayAfterPreviousPageOpenDayUTC < todayDayUTC;
        

        // phase out
        var freezeStreakDateEndUTC = newDateYMDH(2023, 0, 14, 13);
        var freezeStreakDiff = todayTimestampUTC - freezeStreakDateEndUTC;
        var freezeStreak = freezeStreakDiff < 0;
        setStreakFrozen(freezeStreak);
        // phase out


        //return;





        // ensures every refresh will clear data on demo mode
        if (DEMO_MODE)
          newDayArrived = true;



        // If new day arrived, 
        if (newDayArrived) {
          newDay(freezeStreak);
        }

        // if more than one day has passed since you last opened (skipped a day)
        if (moreThanOneNewDayArrived) {
          // reset streak
          if (!DEMO_MODE && !freezeStreak) {
            storageSave("SAVE_STREAK", 0);
            storageSave("SAVE_STREAK_SUPER", 0);
          }

        }


        // Update saved timestamp to now
        storageSave("SAVE_TIMESTAMP_OPEN", (newDate()).toString());

        // Load Save Data
        const saveDataCompletedLevel = storageLoad("SAVE_COMPLETED_LEVEL");
        if (saveDataCompletedLevel !== null)
          setCompletedLevel(parseInt(saveDataCompletedLevel));

        const saveDataPressedLetters = storageLoad("SAVE_PRESSED_LETTERS");
        if (saveDataPressedLetters !== null && saveDataPressedLetters !== undefined)
          setPressedLetters(JSON.parse(saveDataPressedLetters));

        const saveDataCorrectLetters = storageLoad("SAVE_CORRECT_LETTERS");
        if (saveDataCorrectLetters !== null && saveDataCorrectLetters !== undefined)
          setCorrectLetters(JSON.parse(saveDataCorrectLetters));

        const saveDataWrongLetters = storageLoad("SAVE_WRONG_LETTERS");
        if (saveDataWrongLetters !== null && saveDataWrongLetters !== undefined)
          setWrongLetters(JSON.parse(saveDataWrongLetters));

        const saveDataCompletedWordOrder = storageLoad("SAVE_COMPLETED_WORD_ORDER");
        if (saveDataCompletedWordOrder !== null)
          setCompletedWordOrder(JSON.parse(saveDataCompletedWordOrder));

        const saveDataStreak = storageLoad("SAVE_STREAK");
        if (saveDataStreak !== null && saveDataStreak !== undefined)
          setStreak(parseInt(saveDataStreak));

        const saveDataSuperStreak = storageLoad("SAVE_STREAK_SUPER");
        if (saveDataSuperStreak !== null && saveDataSuperStreak !== undefined)
          setSuperStreak(parseInt(saveDataSuperStreak));

        const saveDataSuperStreakHighScore = storageLoad("SAVE_STREAK_SUPER_HIGH_SCORE");
        if (saveDataSuperStreakHighScore !== null && saveDataSuperStreakHighScore !== undefined)
          setSuperStreakHighScore(parseInt(saveDataSuperStreakHighScore));

        const saveDataHistory = storageLoad("SAVE_HISTORY");
        if (saveDataHistory !== null && saveDataHistory !== undefined)
          setHistory(JSON.parse(saveDataHistory));

        const saveDataSelectedKeycap = storageLoad("SAVE_SELECTED_KEYCAP");
        if (saveDataSelectedKeycap !== null && saveDataSelectedKeycap !== undefined)
          setSelectedKeycap(saveDataSelectedKeycap);



        
          

        // Display the help menu for first time players
        const isFirstTime = storageLoad("SAVE_FIRST_TIME");
        if (isFirstTime === null || parseInt(isFirstTime) === 0) {
          storageSave("SAVE_FIRST_TIME", 1);
          setHelpMenuShown(1);
        }



      });



    })

  }, []);


  // ------ CHECKERS

  // Letters Updated
  useEffect(() => {
    // Check if game over
    if (checkGameLost(wrongLetters)) {
      setGameState("GAME_LOST");
    } else if (checkGameWon(correctLetters, levelData.goalPhrase)) {
      setGameState("GAME_WON");
    }
  }, [correctLetters, wrongLetters]);

   

  // Level Data Updated
  useEffect(() => {
    if (levelData.goalPhrase === "...") return;

    // Initialises Completed Word Order
    if (completedWordOrder.length === 0) {
      let initialCompletedWordOrder = [];
      const words = levelData.goalPhrase.split(" ");
      for (var wordIndex = 0; wordIndex < words.length; wordIndex++) {
        initialCompletedWordOrder.push(0);
      }
      setCompletedWordOrder(initialCompletedWordOrder);
    }

  }, [levelData]);



  // Correct Letters Updated
  useEffect(() => {

    if (correctLetters.length === 0) return;


    // --- Updated Word Completed Order
    const words = levelData.goalPhrase.split(" ");
    const wordsCompleted = [];
    const previousCompletedWordOrder = completedWordOrder;

    // gets current words completed
    for (var wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex];
      let isThisWordCompleted = true;
      for (var letterIndex = 0; letterIndex < word.length; letterIndex++) {
        const letter = word[letterIndex];
        if (!correctLetters.includes(letter)) {
          isThisWordCompleted = false;
        }
      }
      wordsCompleted.push(isThisWordCompleted);
    }
    // Get the highest order
    let highestOrder = 0;
    for (var previousCompletedWordOrderIndex = 0; previousCompletedWordOrderIndex < completedWordOrder.length; previousCompletedWordOrderIndex++) {
      const previousCompletedWordOrderValue = completedWordOrder[previousCompletedWordOrderIndex];
      if (previousCompletedWordOrderValue > highestOrder)
        highestOrder = previousCompletedWordOrderValue;
    }
    // goes through and updates new completedWordOrder
    const newCompletedWordOrder = [];
    for (var previousCompletedWordOrderIndex = 0; previousCompletedWordOrderIndex < completedWordOrder.length; previousCompletedWordOrderIndex++) {
      const previousCompletedWordOrderValue = completedWordOrder[previousCompletedWordOrderIndex]; // number saying the order
      const currentCompletedWord = wordsCompleted[previousCompletedWordOrderIndex]; // boolean whether the word has now been completed
      if (previousCompletedWordOrderValue === 0) {
        if (!currentCompletedWord) {
          newCompletedWordOrder.push(0);
        } else {
          newCompletedWordOrder.push(highestOrder + 1);
        }
      } else {
        newCompletedWordOrder.push(previousCompletedWordOrderValue); // if previous word order value is already set, keep using it
      }
    }
    setCompletedWordOrder(newCompletedWordOrder);
  }, [correctLetters]);



  // Game Completion Updates
  useEffect(() => {

    if (gameState === "LOADING") return;

    const isGameOver = gameState === "GAME_WON" || gameState === "GAME_LOST";
    if (isGameOver) {
      if (gameState === "GAME_WON") {
        setGameState("GAME_WON");
      }

      // single fire on completion
      if (completedLevel === 0) {

        // win / lose
        if (gameState === "GAME_WON" && !streakFrozen) {

          // increase streak
          setStreak(streak <= 0 ? 1 : streak + 1);

          if (wrongLetters.length === 0){
            setSuperStreak(superStreak <= 0 ? 1 : superStreak + 1);
          }  else {
            setSuperStreak(0);
          }
        }  else if (gameState === "GAME_LOST" && !streakFrozen) {
            // break streak
            setStreak(0);
            setSuperStreak(0);
        }
        
        // ---- record history
        const currentHistory = history;

        let newHistory = {...currentHistory};
        
        // initialises if history is empty
        if (Object.keys(newHistory).length === 0) {
          newHistory["daysPlayed"] = [];
          newHistory["results"] = {};
        }

        // adds to history
        newHistory["daysPlayed"].push(levelIndex);

        const historyResult = {"correctLetters": correctLetters, "wrongLetters": wrongLetters};
        newHistory["results"][levelIndex] = historyResult;

        setHistory(newHistory);


        // Log analytic
        const eventToLog =  {"level":levelIndex, "heartsRemaining": 3-wrongLetters.length, "pressedLetters": pressedLetters};
        logEvent(analytics, "v01_levelComplete", eventToLog);

      }

      // switches single fire latch (requires loading a new day to switch is back)
      setCompletedLevel(1);
    }

  }, [gameState]);



  // History Updated
  useEffect(() => {

    // If I have played before, and no notification shown for this version exists, show the notification


    var playedBefore = Object.keys(history).length !== 0;
    if (playedBefore) {
      const isGameOver = gameState === "GAME_WON" || gameState === "GAME_LOST";

      if (!isGameOver) {
        const saveDataNewUpdateNotification = storageLoad("SAVE_UPDATE_NOTIFICATION_NEW_"+VERSION_CODE +"_004");
        console.log("Previous notification: " + saveDataNewUpdateNotification);
        if (saveDataNewUpdateNotification === null || saveDataNewUpdateNotification === undefined) {
          setUpdateNotificationShown(1);
        }
        setNewUpdateNotification(0);
      }
    }
    




   if (!playedBefore) return;



    // update progress based on history



  }, [history]);











  // Save Data
  useEffect(() => {
    if (pressedLetters.length === 0) return;
    storageSave("SAVE_PRESSED_LETTERS",  JSON.stringify(pressedLetters));
  }, [pressedLetters]);
  useEffect(() => {
    if (correctLetters.length === 0) return;
    storageSave("SAVE_CORRECT_LETTERS",  JSON.stringify(correctLetters));
  }, [correctLetters]);
  useEffect(() => {
    if (wrongLetters.length === 0) return;
    storageSave("SAVE_WRONG_LETTERS", JSON.stringify(wrongLetters));
  }, [wrongLetters]);

  useEffect(() => {
    if (streak === -1) return;
    if (DEMO_MODE) return;
    storageSave("SAVE_STREAK", streak);
  }, [streak]);

  useEffect(() => {
    if (superStreak === -1) return;
    if (DEMO_MODE) return;
    storageSave("SAVE_STREAK_SUPER", superStreak);
  }, [superStreak]);

  useEffect(() => {
    if (superStreakHighScore === -1) return;
    if (DEMO_MODE) return;
    storageSave("SAVE_STREAK_SUPER_HIGH_SCORE", superStreakHighScore);
  }, [superStreakHighScore]);

  useEffect(() => {
    if (completedLevel === -1) return;
    storageSave("SAVE_COMPLETED_LEVEL", completedLevel);
  }, [completedLevel]);

  useEffect(() => {
    if (completedWordOrder.length === 0) return;
    storageSave("SAVE_COMPLETED_WORD_ORDER", JSON.stringify(completedWordOrder));
  }, [completedWordOrder]);

  useEffect(() => {
    if (Object.keys(history).length === 0) return;
    storageSave("SAVE_HISTORY", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    storageSave("SAVE_UPDATE_NOTIFICATION_SHOWN_"+VERSION_CODE, 0);
  }, [updateNotificationShown]);


  useEffect(() => {
    if (newUpdateNotification === -1) return;
    storageSave("SAVE_UPDATE_NOTIFICATION_NEW_"+VERSION_CODE +"_004", 0);
  }, [newUpdateNotification]);

/*
  return (
    <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}> 
      <div className="update-notification-container">

          <div className="subMenu-header">
              <div className="subMenu-center"> Thank you </div>
              <div className="subMenu-right"></div>
          </div>

          <div className="update-notification-notes">

              Thank you for playing Daydreams! <br/>
              We hope you have had a fun time with our daily game. <br/>

              - <span className="footer-hyperlink"><a className="footer-hyperlink" href="https://www.t-da.io/" target="_blank" rel="noopener noreferrer">T&DA</a></span>
          </div>
      </div>
    </div>
  );

*/
/*
  return (
    <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}> 
      <div className="update-notification-container">

          <div className="subMenu-header">
              <div className="subMenu-center"> ♥ Be Right Back ♥ </div>
              <div className="subMenu-right"></div>
          </div>

          <div className="update-notification-notes">

              We are currently undergoing maintenance. <br/>
              Regularly scheduled Daydreams shall return in the coming days. <br/>
              Thank you for your patience! <br/>

              - <span className="footer-hyperlink"><a className="footer-hyperlink" href="https://www.t-da.io/" target="_blank" rel="noopener noreferrer">T&DA</a></span>
          </div>
      </div>
    </div>
  );
*/
  

  return (
    <div className="App">
      <AppContext.Provider value={{
        onSelectLetter,
        levelData, setLevelData,
        gameState, setGameState,
        pressedLetters, setPressedLetters,
        correctLetters, setCorrectLetters,
        wrongLetters, setWrongLetters,
        isLastLetterCorrect, setIsLastLetterCorrect,
        completedWordOrder, setCompletedWordOrder,
        completedLevel, setCompletedLevel,
        streak, setStreak,
        superStreak, setSuperStreak,
        superStreakHighScore, setSuperStreakHighScore,
        acceptSelectLetter, setAcceptSelectLetter,
        selectedDreamDisplayIndex, setSelectedDreamDisplayIndex,
        isDreamDisplayAutoMode, setIsDreamDisplayAutoMode,
        gameTitle, setGameTitle,
        gameURL, setGameURL,
        versionCode, setVersionCode,
        levelIndex, setLevelIndex,
        livesCompletedPulse, setLivesCompletedPulse,
        shareButtonClicked, setShareButtonClicked,
        helpMenuShown, setHelpMenuShown,
        medalsShown, setMedalsShown,
        newUpdateNotification, setNewUpdateNotification,
        updateNotificationShown, setUpdateNotificationShown,
        history, setHistory,
        selectedKeycap, setSelectedKeycap,
        streakFrozen, setStreakFrozen,
        onSelectKeycap,
        todayIndex
      }}>

        <Header />
        <Game />
        <HelpMenu />
        <Medals />
        
        <UpdateNotification/>
      </AppContext.Provider>

    </div>);
}

export default App;



/*

  TODO:
  - More keycap skins
  - Prompt players when they unlock a new skin

*/