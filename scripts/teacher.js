import {auth, db, storage} from './firebase.js';
import { getAuth, signOut, onAuthStateChanged, updateEmail } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";

let userID = "";
let myPupils = [];
let filteredPupils = [];
let allHomeworks = [];
let classInformation = undefined;
let myData = undefined;

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

const applyFilterValue = (filter, action) => {
    filteredPupils = myPupils.filter(item => item.fullName.toLowerCase().startsWith(filter.toLowerCase()));
    action();
}

const renderContent = async() => {
    mainContainer.innerHTML = "";
    const querySnapshot1 = await getDocs(collection(db, "userInfo"));
    querySnapshot1.forEach((doc) => {
        myPupils.push(doc.data());
    });
    const querySnapshot2 = await getDocs(collection(db, "homework"));
    querySnapshot2.forEach((doc) => {
        allHomeworks.push(doc.data());
    });
    filteredPupils = myPupils;
    if(userID !== ""){
        const docRef = doc(db, "userInfo", userID.toString());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            myData = docSnap.data();
        }
        const docRef2 = doc(db, "classInformation", myData.class.toString());
        const docSnap2 = await getDoc(docRef2);
        if (docSnap2.exists()) {
            classInformation = docSnap2.data();
        }
    }
    

    if(parseInt(selectedOption) === 1){
        renderAddHomeWork();
    }else if(parseInt(selectedOption) === 2){
        renderPupilAcitvity();
    }else if(parseInt(selectedOption) === 3){
        renderSeeAndManagePupils();
    }
}

const addToClass = async(pupilID) => {
    const addRef = doc(db, "classInformation", myData.class.toString());
    await updateDoc(addRef, {
        pupils: arrayUnion(pupilID)
    });
    classInformation.pupils.push(pupilID);
    renderSeeAndManagePupils();
}

const removeFromClass = async(pupilID) => {
    const addRef = doc(db, "classInformation", myData.class.toString());
    await updateDoc(addRef, {
        pupils: arrayRemove(pupilID)
    });
    classInformation.pupils.splice(classInformation.pupils.indexOf(pupilID), 1);
    renderSeeAndManagePupils();
}

const handleUploadHomeWork = async(textArray) => {
    const d = new Date();
    const docRef = await addDoc(collection(db, "homework"), {
        homeworkTextArray: textArray,
        teacherID: userID,
        dateUploaded: d,
        assignedTo: classInformation.pupils,
        doneIt: [],
    });
    window.location = "./login.html";
}

const renderAddHomeWork = () => {
    const contentWrapper = document.createElement("div");
    contentWrapper.classList.add("teacher-content-wrapper");
    contentWrapper.setAttribute("id","teacher-content-wrapper");
    const mainTitle = document.createElement("h3");

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

        handleUploadHomeWork(textAreaValue);

    });
    contentWrapper.appendChild(submitButton);

    const previousHomeworks = document.createElement("div");
    previousHomeworks.classList.add("previous-homeworks");
    previousHomeworks.innerHTML += "<h3>Pretekle domače naloge</h3>";
    allHomeworks.sort((a, b) => (a.dateUploaded > b.dateUploaded) ? -1 : ((b.dateUploaded > a.dateUploaded) ? 1 : 0))
    allHomeworks.forEach(item => {
        if(item.teacherID.toString() === myData.userID){
            let homeworkText = "";
            item.homeworkTextArray.forEach(item => {
                homeworkText += item;
                homeworkText += " ";
            });
            const homeworkWrapper = document.createElement("div");
            homeworkWrapper.classList.add("homework-wrapper");
            const date = new Date(item.dateUploaded.seconds*1000);
            homeworkWrapper.innerHTML = `
                <span><b>Dodeljena:</b> ${date.getDate()}. ${(parseInt(date.getMonth())+1)}. ${date.getFullYear()}.</span>
                <span><b>Besedilo:</b> ${homeworkText.substring(0,50).toUpperCase()}...</span>
            `;
            homeworkWrapper.innerHTML += "<span><b>Nalogo so naredili: </b></span>";
            if(item.doneIt !== undefined && item.doneIt.length !== 0){
                let listOfStudents = "";
                item.doneIt.forEach((subitem, index) =>{
                    listOfStudents += subitem;
                    if(index !== item.doneIt.length-1){
                        listOfStudents += ", ";
                    }else{
                        listOfStudents += ".";
                    }
                });
                homeworkWrapper.innerHTML += listOfStudents;
            }else{
                homeworkWrapper.innerHTML += "Še nobeden";
            }
            previousHomeworks.appendChild(homeworkWrapper);
        }
    });
    contentWrapper.appendChild(previousHomeworks);

    mainContainer.appendChild(contentWrapper);
}

const renderPupilAcitvity = () => {
    const contentWrapper = document.createElement("div");
    contentWrapper.classList.add("teacher-content-wrapper");
    contentWrapper.setAttribute("id","teacher-content-wrapper");
    const mainTitle = document.createElement("h3");
    mainTitle.innerText = "Aktivnost učencev";
    contentWrapper.appendChild(mainTitle);

    const firstRow = document.createElement("div");
    firstRow.classList.add("subcontent-first-row");
    firstRow.innerHTML = `
        <div class="first-row-col" id="first-row-col-1">
            #
        </div>
        <div class="first-row-col" id="first-row-col-2">
            Ime in priimek <ion-icon id="sort-content-icon1" name="swap-vertical-outline" />
        </div>
        <div class="first-row-col" id="first-row-col-3">
            Nazadnje aktiven <ion-icon id="sort-content-icon2" name="swap-vertical-outline" />
        </div>
        <div class="first-row-col" id="first-row-col-4">
            <ion-icon id="sort-content-icon3" name="add-outline" />
        </div>
    `;
    contentWrapper.appendChild(firstRow);
    const allUsersContainer = document.createElement("div");
    allUsersContainer.classList.add("teacher-manage-pupils-wrapper");
    allUsersContainer.style.height = "fit-content";
    myPupils.forEach((item, index) => {
        if(classInformation.pupils.indexOf(item.userID) !== -1){
            let lastOnline = item.lastOnline;
            let currentDate = new Date().getTime();
            let timeDifference = currentDate - lastOnline;
            if(timeDifference < (60 * 1000)){
                timeDifference = "Manj kot minuto nazaj."
            }else if(timeDifference < (60 * 1000 * 60)){
                timeDifference = Math.floor(timeDifference/1000/60) + ` 
                ${
                    Math.floor(timeDifference/1000/60) === 1 ? "minuto"
                    : Math.floor(timeDifference/1000/60) === 2 ? "minuti"
                    : Math.floor(timeDifference/1000/60) === 3 ? "minute"
                    : Math.floor(timeDifference/1000/60) === 4 ? "minute"
                    : "minut"
                }
                 nazaj.`;
            }else if(timeDifference < (60 * 1000 * 60 * 24)){
                timeDifference = Math.floor(timeDifference/1000/60/60) + ` 
                ${
                    Math.floor(timeDifference/1000/60/60) === 1 ? "uro"
                    : Math.floor(timeDifference/1000/60/60) === 2 ? "uri"
                    : Math.floor(timeDifference/1000/60/60) === 3 ? "ure"
                    : Math.floor(timeDifference/1000/60/60) === 4 ? "ure"
                    : "ur"
                }
                 nazaj.`;
            }else if(timeDifference < (60 * 1000 * 60 * 24 * 31)){
                timeDifference = Math.floor(timeDifference/1000/60/60/24) + ` 
                ${
                    Math.floor(timeDifference/1000/60/60/24) === 1 ? "dan"
                    : Math.floor(timeDifference/1000/60/60/24) === 2 ? "dneva"
                    : Math.floor(timeDifference/1000/60/60/24) === 3 ? "dneve"
                    : Math.floor(timeDifference/1000/60/60/24) === 4 ? "dneve"
                    : "dni"
                }
                 nazaj.`;
            }else if(timeDifference > (60 * 1000 * 60 * 24 * 31)){
                timeDifference = `Več kot mesec dni nazaj.`;
            }else{
                timeDifference = `n/a`;
            }
            const userWrapper = document.createElement("div");
            userWrapper.classList.add("subcontent-user-wrapper");
            userWrapper.innerHTML = `
            <div id="first-row-col-1">
                ${index+1}
            </div>
            <div id="first-row-col-2">
                ${item.fullName}
            </div>
            <div id="first-row-col-3">
                ${timeDifference}
            </div>
            `;

            allUsersContainer.appendChild(userWrapper);
        }
    });
    contentWrapper.appendChild(allUsersContainer);
    mainContainer.appendChild(contentWrapper);
}

const renderSeeAndManagePupils = () => {
    const contentWrapper = document.createElement("div");
    contentWrapper.classList.add("teacher-content-wrapper");
    contentWrapper.setAttribute("id","teacher-content-wrapper");
    const mainTitle = document.createElement("h3");

    document.getElementById("main-container").innerHTML = "";

    mainTitle.innerText = "Upravljaj z učenci";
    contentWrapper.appendChild(mainTitle);

    const myPupilsContainer = document.createElement("div");
    myPupilsContainer.classList.add("my-pupils-container");
    const subTitle = document.createElement("h4");
    subTitle.innerText = "Moje učenke in učenci";
    myPupilsContainer.appendChild(subTitle);
    myPupils.forEach((item, index) => {
        if(classInformation.pupils.indexOf(item.userID) !== -1){
            const userWrapper = document.createElement("div");
            userWrapper.classList.add("subcontent-user-wrapper");
            userWrapper.innerHTML = `
            <div id="first-row-col-1">
                ${index+1}
            </div>
            <div id="first-row-col-2">
                ${item.fullName}
            </div>
            <div id="first-row-col-3">
                ${item.class}
            </div>
            `;

            const manageIcons = document.createElement("div");
            manageIcons.setAttribute("id", "first-row-col-4");
            const removeIcon = document.createElement("div");
            removeIcon.setAttribute("id", "add-pupil-to-class");
            removeIcon.innerHTML = "<span title='Odstrani učenca/ko iz svojega razreda.'><ion-icon name='remove-outline'></ion-icon></span>"
            removeIcon.addEventListener("click", ()=>{
                removeFromClass(item.userID);
            });
            manageIcons.appendChild(removeIcon);
            userWrapper.appendChild(manageIcons);

            myPupilsContainer.appendChild(userWrapper);
        }
    });
    contentWrapper.appendChild(myPupilsContainer);

    const searchFieldWrapper = document.createElement("div");
    searchFieldWrapper.classList.add("admin-content-search-field-wrapper");
    const searchIcon = document.createElement("ion-icon");
    searchIcon.setAttribute("id", "admin-content-search-icon");
    searchIcon.setAttribute("name", "search-outline");
    searchFieldWrapper.appendChild(searchIcon);
    const searchField = document.createElement("input");
    searchField.addEventListener("keyup", ()=>{
        if(searchField.value.length === 0){
            filteredPupils = myPupils;
            renderUsers();
        }else{
            applyFilterValue(searchField.value, renderUsers);
        }
    });
    searchField.setAttribute("type", "text");
    searchField.classList.add("admin-content-search-field");
    searchField.setAttribute("id","admin-content-search-field");
    searchField.setAttribute("placeholder", "Vnesi ime učenca...");
    searchFieldWrapper.appendChild(searchField);

    const firstRow = document.createElement("div");
    firstRow.classList.add("subcontent-first-row");
    firstRow.innerHTML = `
        <div class="first-row-col" id="first-row-col-1">
            #
        </div>
        <div class="first-row-col" id="first-row-col-2">
            Ime in priimek <ion-icon id="sort-content-icon1" name="swap-vertical-outline" />
        </div>
        <div class="first-row-col" id="first-row-col-3">
            Razred <ion-icon id="sort-content-icon2" name="swap-vertical-outline" />
        </div>
        <div class="first-row-col" id="first-row-col-4">
            <ion-icon id="sort-content-icon3" name="add-outline" />
        </div>
    `;
    const allUsersContainer = document.createElement("div");
    allUsersContainer.classList.add("teacher-manage-pupils-wrapper");
    const renderUsers = () => {
        allUsersContainer.innerHTML = "";
        filteredPupils.forEach((item, index) => {
            if(classInformation.pupils.indexOf(item.userID) === -1 && !item.admin && !item.teacher){
                const userWrapper = document.createElement("div");
                userWrapper.classList.add("subcontent-user-wrapper");
                userWrapper.innerHTML = `
                <div id="first-row-col-1">
                    ${index+1}
                </div>
                <div id="first-row-col-2">
                    ${item.fullName}
                </div>
                <div id="first-row-col-3">
                    ${item.class}
                </div>
                `;

                const manageIcons = document.createElement("div");
                manageIcons.setAttribute("id", "first-row-col-4");
                const addIcon = document.createElement("div");
                addIcon.setAttribute("id", "add-pupil-to-class");
                addIcon.innerHTML = "<span title='Dodaj učenca/ko v svoj razred.'><ion-icon name='add-outline'></ion-icon></span>"
                addIcon.addEventListener("click", ()=>{
                    addToClass(item.userID);
                });
                manageIcons.appendChild(addIcon);
                userWrapper.appendChild(manageIcons);

                allUsersContainer.appendChild(userWrapper);
            }
        });
    }

    renderUsers();

    contentWrapper.appendChild(searchFieldWrapper);
    contentWrapper.appendChild(firstRow);
    contentWrapper.appendChild(allUsersContainer);
    mainContainer.appendChild(contentWrapper);
}

renderContent();