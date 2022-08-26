import {auth, db, storage} from './firebase.js';
import { doc, getDoc, updateDoc, addDoc, setDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";

let userData = [];

const openedURL = new URL(window.location.href);
const selectedOption = openedURL.searchParams.get("option");
console.log("selected option: ", selectedOption);
const mainContainer = document.getElementById("main-container");
mainContainer.innerHTML = "";

const contentWrapper = document.createElement("div");
contentWrapper.classList.add("admin-content-wrapper");
const title = document.createElement("h3");
title.classList.add("admin-content-title");
const searchFieldWrapper = document.createElement("div");
searchFieldWrapper.classList.add("admin-content-search-field-wrapper");
const searchIcon = document.createElement("ion-icon");
searchIcon.setAttribute("id", "admin-content-search-icon");
searchIcon.setAttribute("name", "search-outline");
searchFieldWrapper.appendChild(searchIcon);
const searchField = document.createElement("input");
searchField.setAttribute("type", "text");
searchField.classList.add("admin-content-search-field");

title.innerText = selectedOption === "1" ? "Učitelji" : "Učenci";
contentWrapper.appendChild(title);

searchField.setAttribute("placeholder", selectedOption === "1" ? "Vnesi ime učitelja..." : "Vnesi ime učenca...");
searchFieldWrapper.appendChild(searchField);
contentWrapper.appendChild(searchFieldWrapper);

const subcontentContainer = document.createElement("div");
subcontentContainer.classList.add("admin-content-subcontent");

const firstRow = document.createElement("div");
firstRow.classList.add("subcontent-first-row");
firstRow.innerHTML = `
    <div class="first-row-col" id="first-row-col-1">
        #
    </div>
    <div class="first-row-col" id="first-row-col-2">
        Ime in priimek
    </div>
    <div class="first-row-col" id="first-row-col-3">
        Razred
    </div>
    <div class="first-row-col" id="first-row-col-4">
        <ion-icon name="hammer-outline" />
    </div>
`;

contentWrapper.appendChild(firstRow);

const getUserData = async() =>{
    const querySnapshot = await getDocs(collection(db, "userInfo"));
    querySnapshot.forEach((doc) => {
        userData.push(doc.data());
    });
    renderContent();
}

const renderContent = () =>{
    console.log(userData);

    userData.forEach((item, index) => {
        if(!item.admin && !item.teacher){
            const userWrapper = document.createElement("div");
            userWrapper.classList.add("subcontent-user-wrapper");
            userWrapper.innerHTML = `
                <div id="first-row-col-1">
                    ${index}
                </div>
                <div id="first-row-col-2">
                    ${item.fullName}
                </div>
                <div id="first-row-col-3">
                    ${item.class}
                </div>
            `;
            const trashIcon = document.createElement("div");
            trashIcon.innerHTML = `<ion-icon name="trash-outline" />`
            trashIcon.setAttribute("id", "first-row-col-4");
            trashIcon.addEventListener("click", ()=>{
                console.log("clicked on trash");
            });
            userWrapper.appendChild(trashIcon);
            subcontentContainer.appendChild(userWrapper);
        }
    });
    contentWrapper.appendChild(subcontentContainer);
    document.body.appendChild(contentWrapper);
}

getUserData();