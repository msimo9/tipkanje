import {auth, db, storage} from './firebase.js';
import { getAuth, signOut, onAuthStateChanged, updateEmail } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";

let userID = "";

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        userID = uid;
    }
});

const openedURL = new URL(window.location.href);
const selectedOption = openedURL.searchParams.get("option");

const mainContainer = document.getElementById("main-container");
mainContainer.innerHTML = "";

const contentWrapper = document.createElement("div");
contentWrapper.classList.add("teacher-content-wrapper");
const mainTitle = document.createElement("h3");

const renderContent = () => {
    if(parseInt(selectedOption) === 1){
        renderAddHomeWork();
    }else if(parseInt(selectedOption) === 2){
        renderPupilAcitvity();
    }else if(parseInt(selectedOption) === 3){
        renderSeeAndManagePupils();
    }
}

const handleUploadHomeWork = async(textArray) => {
    const d = new Date();
    const docRef = await addDoc(collection(db, "homework"), {
        homeworkTextArray: textArray,
        teacherID: userID,
        dateUploaded: d,
        assignedTo: "all",
    });
    console.log("Document written with ID: ", docRef.id);
}

const renderAddHomeWork = () => {
    mainTitle.innerText = "Dodeli domačo nalogo";
    contentWrapper.appendChild(mainTitle);

    const fieldsWrapper = document.createElement("div");
    fieldsWrapper.classList.add("teacher-fields-wrapper");
    const titleField = document.createElement("div");
    titleField.setAttribute("id", "add-homework-title-field")
    titleField.innerHTML = "<h4>Vnesi željeno besedilo </h4><span title='Besedilo bo avtomatično pretvorjeno v velike tiskane črke.'><ion-icon name='information-circle-outline'></ion-icon></span>";
    fieldsWrapper.appendChild(titleField);
    const textArea = document.createElement("textarea");
    textArea.setAttribute("id", "teacher-add-homework-area");
    fieldsWrapper.appendChild(textArea);
    contentWrapper.appendChild(fieldsWrapper);

    const submitButton = document.createElement("div");
    submitButton.classList.add("button");
    submitButton.setAttribute("id","teacher-content-submit-button");
    submitButton.innerText = "Dodeli";
    submitButton.addEventListener("click", ()=>{
        let textAreaValue = textArea.value;

        textAreaValue = textAreaValue.replaceAll('\n', ' ').replaceAll(",","").replaceAll("-","").replaceAll('—','').replaceAll("!","").replaceAll("?","").replaceAll(".","").replaceAll(";","").split(' ');

        textAreaValue.forEach((item, index) => {
            if(item === ""){
                textAreaValue.splice(index, 1);
            }
        });

        /*let tempArr = [];
        textAreaValue.forEach((item, index) => {
            tempArr.push(item);
            tempArr.push("␣");
        });
        textAreaValue = tempArr;*/

        console.log("besedilo: ", textAreaValue);
        handleUploadHomeWork(textAreaValue);

    });
    contentWrapper.appendChild(submitButton);

    mainContainer.appendChild(contentWrapper);
}

const renderPupilAcitvity = () => {
    mainTitle.innerText = "Aktivnost učencev";
    contentWrapper.appendChild(mainTitle);
    mainContainer.appendChild(contentWrapper);
}

const renderSeeAndManagePupils = () => {
    mainTitle.innerText = "Upravljaj z učenci";
    contentWrapper.appendChild(mainTitle);
    mainContainer.appendChild(contentWrapper);
}

renderContent();