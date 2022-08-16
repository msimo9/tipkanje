const mainContent = document.getElementById("main-content");

let exercises = localStorage.getItem('exercises');
exercises = exercises.split(",");
let timeAdded = localStorage.getItem("timeAdded");
console.log("exercises: ", exercises);
console.log("timeAdded: ", timeAdded);

let sampleString = "Bezgov brizgec brizga bezgovo brozgo";
let cutSampleString = sampleString;
cutSampleString = cutSampleString.replaceAll(" ", "␣")
mainContent.innerText = cutSampleString.toUpperCase();

window.addEventListener("keydown", (e)=>{
    const currentKey = e.key;
    const currentLetter = cutSampleString.substring(0,1);
    //␣
    if(
        currentKey.toUpperCase() === currentLetter.toUpperCase()
        ||
        currentKey === " " && currentLetter === "␣"
    ){
        cutSampleString = cutSampleString.substring(1, cutSampleString.length);
        if(cutSampleString.length === 0 || cutSampleString === ""){
            cutSampleString = sampleString;
            cutSampleString = cutSampleString.replaceAll(" ", "␣")
        }
        mainContent.innerText = cutSampleString.toUpperCase();
    }
});