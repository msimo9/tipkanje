import {auth, db, storage} from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc  } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";

const mainContent = document.getElementById("main-content");
const wordsContainer = document.createElement("div");
wordsContainer.classList.add("content-words-container");

const errrorsContainer = document.createElement("div");
errrorsContainer.setAttribute("id", "content-errors-container");
mainContent.appendChild(errrorsContainer);


let userID = "";
let userInfo = undefined;

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        userID = uid;
        getUserData();
    }
});

const getUserData = async() => {
    const docRef = doc(db, "userInfo", userID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        userInfo = docSnap.data();
    }
}

let numberOfErrors = 0;
let errorFlag = true;
let stringToType = "";
let exercises = undefined;
let tocke = 0;
let homework = undefined;

const getData = () =>{
    exercises = localStorage.getItem('exercises');
    if(exercises !== null) exercises = exercises.split(",");
    let timeAdded = localStorage.getItem("timeAdded");
    if(exercises !== null && timeAdded !== null){
        let currentTime = new Date();
        currentTime = currentTime.getTime();
        if((currentTime-timeAdded) > (10*60*1000)){
            window.localStorage.clear();
        }
    }
    fillUpWords();
}

const finishHomework = async() => {
    let homeworkID = localStorage.getItem("homeworkID");
    const homeworkRef = doc(db, "homework", homeworkID);
    await updateDoc(homeworkRef, {
        doneIt: arrayUnion(userInfo.fullName),
        doneItIDs: arrayUnion(userID),
    });
    window.localStorage.clear();
    window.location = "./pages/homework.html";
}

const fillUpWords = () => {
    homework = localStorage.getItem("homework");
    if(homework === null){
        stringToType = "";
        if(exercises !== null){
            for(let i = 0; i < 20; i++){
                stringToType += exercises[Math.floor(Math.random() * exercises.length + 0)];
                if(i !== 19) stringToType += " ";
            }
        }else{
            stringToType = "Bezgov brizgec brizga bezgovo brozgo";
        }
    }else{
        stringToType = "";
        if(exercises !== null){
            stringToType = exercises.join(" ");
        }else{
            stringToType = "Bezgov brizgec brizga bezgovo brozgo";
        }
    }
    mainApp();
}

const dividerBlink = () => {
    const dividerRef = document.getElementById("words-container-divider");
    if(dividerRef.style.borderLeft === "2px solid #2C3333"){
        dividerRef.style.borderLeft = "2px solid transparent";
    }else if(dividerRef.style.borderLeft === "2px solid transparent"){
        dividerRef.style.borderLeft = "2px solid #2C3333";
    }else{
        dividerRef.style.borderLeft = "2px solid transparent";
    }
    setTimeout(()=>{
        dividerBlink();
    }, 500)
}

const firstCharBlink = () => {
    const firstCharRef = document.getElementById("first-char-line");
    if(firstCharRef.style.opacity == "1"){
        firstCharRef.style.opacity = "0";
    }else{
        firstCharRef.style.opacity = "1";
    }
    setTimeout(()=>{
        firstCharBlink();
    }, 600);
}

const mainApp = () => {

    errrorsContainer.innerHTML = `Število napak: <b>${numberOfErrors}</b>`;

    const column1 = document.createElement("div");
        column1.setAttribute("id", "words-column-1");
    const column2 = document.createElement("div");
        column2.setAttribute("id", "words-column-2");

    const firstCharLine = document.createElement("div");
        firstCharLine.setAttribute("id", "first-char-line");

    const divider = document.createElement("div");
        divider.setAttribute("id", "words-container-divider");
        divider.appendChild(firstCharLine);

    let sampleString = stringToType;
    let cutSampleString = sampleString;
    cutSampleString = cutSampleString.replaceAll(" ", "␣");
    column2.innerText = cutSampleString.toUpperCase();

    let correctFlag = true;
    
    wordsContainer.appendChild(column1);
    wordsContainer.appendChild(divider);
    wordsContainer.appendChild(column2);

    mainContent.appendChild(wordsContainer);
    
    window.addEventListener("keypress", (e)=>{
        const currentKey = e.key;
        const currentLetter = cutSampleString.substring(0,1);
        //␣
        if(
            currentKey.toUpperCase() === currentLetter.toUpperCase()
            ||
            currentKey === " " && currentLetter === "␣"
        ){
            const charSpan = document.createElement("span");
            charSpan.innerText = cutSampleString.substring(0, 1).toUpperCase();
            charSpan.style.color = correctFlag === true ? "green" : "red";
            column1.appendChild(charSpan);
            correctFlag = true;


            cutSampleString = cutSampleString.substring(1, cutSampleString.length);
            
            if(cutSampleString.length === 0 || cutSampleString === ""){
                document.getElementById("words-column-1").remove();
                document.getElementById("words-column-2").remove();
                document.getElementById("words-container-divider").remove();
                fillUpWords();
                if(homework !== null){
                    finishHomework();
                }
                numberOfErrors = 0;
                errrorsContainer.innerHTML = `Število napak: <b>${numberOfErrors}</b>`;
                /*cutSampleString = sampleString;
                cutSampleString = cutSampleString.replaceAll(" ", "␣");
                column1.innerHTML = "";*/
            }

            column2.innerText = cutSampleString.toUpperCase();
        }else if(correctFlag){
            correctFlag = false;
            numberOfErrors++;
            errrorsContainer.innerHTML = `Število napak: <b>${numberOfErrors}</b>`;
        }
    });

    //dividerBlink();
    firstCharBlink();
}

getData();
