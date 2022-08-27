import {auth, db, storage} from './firebase.js';
import { deleteUser } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";

let userData = [];
let filteredUsers = [];

const filterBySearchString = (filterValue) =>{
    filteredUsers = userData.filter((element)=>{
        return element.fullName.toLowerCase().startsWith(filterValue.toLowerCase());
    });
    console.log(filteredUsers);
    renderContent();
    document.getElementById("admin-content-search-field").focus();
}

const openedURL = new URL(window.location.href);
const selectedOption = openedURL.searchParams.get("option");
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
searchField.addEventListener("keyup", ()=>{
    filterBySearchString(searchField.value);
});
searchField.setAttribute("type", "text");
searchField.classList.add("admin-content-search-field");
searchField.setAttribute("id","admin-content-search-field");

title.innerText = selectedOption === "1" ? "Učitelji" : "Učenci";
contentWrapper.appendChild(title);

searchField.setAttribute("placeholder", selectedOption === "1" ? "Vnesi ime učitelja..." : "Vnesi ime učenca...");
searchFieldWrapper.appendChild(searchField);
contentWrapper.appendChild(searchFieldWrapper);

const subcontentContainer = document.createElement("div");
subcontentContainer.classList.add("admin-content-subcontent");

const sortContent = (option) =>{
    if(option === 1){
        userData.sort((a, b) => a.fullName.localeCompare(b.fullName));
        renderContent();
    }
    else if(option === 2){
        userData.sort((a, b) => a.class.localeCompare(b.class));
        renderContent();
    }
    else if(option === 3){
        userData.sort((a, b) => a.banned.toString().localeCompare(b.banned.toString()));
        renderContent();
    }
}

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
        <ion-icon id="sort-content-icon3" name="hammer-outline" />
    </div>
`;

contentWrapper.appendChild(firstRow);

const banUser = async(userID) => {
    const banRef = doc(db, "userInfo", userID.toString());
    await updateDoc(banRef, {
        banned: true
    });
    getUserData();
}

const unbanUser = async(userID) => {
    const banRef = doc(db, "userInfo", userID.toString());
    await updateDoc(banRef, {
        banned: false
    });
    getUserData();
}

const addToTeachers = async(userID) => {
    const teacherRef = doc(db, "userInfo", userID.toString());
    await updateDoc(teacherRef, {
        teacher: true
    });
    getUserData();
}

const removeFromTeachers = async(userID) => {
    const teacherRef = doc(db, "userInfo", userID.toString());
    await updateDoc(teacherRef, {
        teacher: false
    });
    getUserData();
}

const getUserData = async() =>{
    userData = [];
    const querySnapshot = await getDocs(collection(db, "userInfo"));
    querySnapshot.forEach((doc) => {
        userData.push(doc.data());
    });
    filteredUsers = userData;
    renderContent();
}

const renderContent = () =>{
    subcontentContainer.innerHTML = "";
    console.log(userData);
    let counter = 1;
    console.log("selected option ", selectedOption);
    filteredUsers.forEach((item, index) => {
        if(selectedOption.toString() === "2" && !item.admin && !item.teacher || selectedOption.toString() === "1" && !item.admin && item.teacher){
            const userWrapper = document.createElement("div");
            userWrapper.classList.add("subcontent-user-wrapper");
            userWrapper.innerHTML = `
                <div id="first-row-col-1">
                    ${counter}
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

            const trashIcon = document.createElement("div");
            trashIcon.innerHTML = `
            <ion-icon id="manage-icon" name=${!item.banned ? "ban-outline" : "checkmark-outline"} />
            `;
            trashIcon.addEventListener("click", ()=>{
                if(!item.banned){
                    banUser(item.userID);
                }else{
                    unbanUser(item.userID);
                }
            });

            const handleTeacherIcon = document.createElement("div");
            handleTeacherIcon.style.marginLeft = "3px";
            handleTeacherIcon.innerHTML = `
            <ion-icon id="manage-icon" name=${!item.teacher ? "person-add-outline" : "person-remove-outline"} />
            `;
            handleTeacherIcon.addEventListener("click", ()=>{
                if(!item.teacher){
                    addToTeachers(item.userID);
                }else{
                    removeFromTeachers(item.userID);
                }
            });

            manageIcons.appendChild(trashIcon);
            manageIcons.appendChild(handleTeacherIcon);
            userWrapper.appendChild(manageIcons);
            subcontentContainer.appendChild(userWrapper);
            counter++;
        }
    });
    contentWrapper.appendChild(subcontentContainer);
    document.body.appendChild(contentWrapper);

    document.getElementById("sort-content-icon1").addEventListener("click", ()=>{
        sortContent(1);
    })
    document.getElementById("sort-content-icon2").addEventListener("click", ()=>{
        sortContent(2);
    })
    document.getElementById("sort-content-icon3").addEventListener("click", ()=>{
        sortContent(3);
    })
}

getUserData();