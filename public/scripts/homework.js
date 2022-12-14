import {auth, db, storage} from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";
import { doc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";

let userID = "";
let userInfo = undefined;
let allHomeworks = [];
let allHomeworksIds = [];

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        userID = uid;
        getUserData();
    } else {

    }
});

const getUserData = async() => {
    const docRef = doc(db, "userInfo", userID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        userInfo = docSnap.data();
    }

    //homeworks
    const querySnapshot = await getDocs(collection(db, "homework"));
    querySnapshot.forEach((doc) => {
        let customObj = doc.data();
        customObj["homeworkID"] = doc.id;
        allHomeworks.push(customObj);
    });

    renderContent();
}

//homework.teacherID => userInfo.teacherID.class => class.pupils.currentUserID => if includes show, else don't

const renderContent = () => {
    const mainContainer = document.getElementById("main-container");
    mainContainer.innerHTML = "";

    const homeworkContainer = document.createElement("div");
    homeworkContainer.classList.add("homework-container");
    homeworkContainer.innerHTML = "<h3>Domače naloge</h3>";
    allHomeworks = allHomeworks.filter(item =>{ return item.assignedTo.indexOf(userID) !== -1 && item.doneItIDs.indexOf(userID) === -1 });
    console.log("all homeworks: ", allHomeworks);
    if(allHomeworks.length !== 0){
        allHomeworks.map((item, index) => {
            if(item.assignedTo.indexOf(userID) !== -1 && item.doneItIDs.indexOf(userID) === -1){
                const dateU = new Date(item.dateUploaded.seconds*1000);
                let hwText = "";
                item.homeworkTextArray.forEach(item => {
                    hwText += item;
                    hwText += " ";
                })
                const wrapperDiv = document.createElement("div");
                wrapperDiv.classList.add("homework-wrapper-div");
                wrapperDiv.innerHTML = `
                    <h4><b>Datum:</b> ${dateU.getDate()}. ${(parseInt(dateU.getMonth()) + 1)}. ${dateU.getFullYear()}</h4>
                    <span><b>Besedilo:</b> ${hwText.substring(0, 200)}...</span>
                `;
                const startButton = document.createElement("div");
                startButton.innerText = "Začni";
                startButton.addEventListener("click", ()=>{
                    const timeAdded = new Date();
                    localStorage.setItem("timeAdded", timeAdded.getTime());
                    localStorage.setItem("homework", "true");
                    localStorage.setItem("homeworkID", item.homeworkID);
                    localStorage.setItem("exercises", item.homeworkTextArray.join(","));
                    window.location = "../index.html";
                });
                startButton.classList.add("homework-start-button");
                wrapperDiv.appendChild(startButton);
                homeworkContainer.appendChild(wrapperDiv);
            }
        });
    }else{
        homeworkContainer.innerHTML += `
            <div class="all-homeworks-done">
                <img src="../assets/homework-done-2.png" />
                <span>Vse naloge so narejene!</span>
            </div>
        `;
        console.log("People illustrations by Storyset: https://storyset.com/people");
    }

    mainContainer.appendChild(homeworkContainer);
}