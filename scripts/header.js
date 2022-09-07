import {auth, db} from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";

const header = document.getElementById("header");

const pageTitle = document.title;
let userID = "";
let userInfo = undefined;

onAuthStateChanged(auth, (user) => {
    if(document.getElementById("loggin-wrapper")){
        document.getElementById("loggin-wrapper").remove();
    }
    if (user) {
        const uid = user.uid;
        userID = uid;
        getUserData(userID, true);
    } else {
        getUserData("", false);
    }
        
});

const getUserData = async(userID, loggedIn) =>{
    const loginWrapper = document.createElement("div");
    loginWrapper.setAttribute("id", "loggin-wrapper");
    if(loggedIn){
        const docRef = doc(db, "userInfo", userID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            userInfo = docSnap.data();
            loginWrapper.innerHTML = `<span>${userInfo.fullName}</span><img id="header-profile-photo" src="${userInfo.profileImageURL}" />`;
            loginWrapper.addEventListener("click", ()=>{
                window.location = `./${pageTitle !== "DPT" ? "" : "pages/"}login.html`;
            });
        }
    }else{
        loginWrapper.innerHTML = `<span>Prijavi se!</span>`;
        //document.getElementById("Prijava-option").innerText = "Prijava";
        loginWrapper.addEventListener("click", ()=>{
            window.location = `./${pageTitle !== "DPT" ? "" : "pages/"}login.html`;
        });
    }
    renderContent();
    header.appendChild(loginWrapper);
}

const renderContent = () => {

    const toggleModalMenu = () =>{
        if(modalMenu.style.display === "none"){
            modalMenu.style.animation = "slide-right 500ms linear";
            setTimeout(()=>{
                modalMenu.style.display = "flex";
            },  490);
        }else if(modalMenu.style.display === "flex"){
            modalMenu.style.animation = "slide-left 500ms linear";
            setTimeout(()=>{
                modalMenu.style.display = "none";
            },  490);
        }else{
            modalMenu.style.animation = "slide-right 500ms linear";
            setTimeout(()=>{
                modalMenu.style.display = "flex";
            },  490);
        }
    }

    const menuIconWrapper = document.createElement("div");
    menuIconWrapper.setAttribute("id", "menu-icon");
    const menuIcon = document.createElement("ion-icon");
    menuIcon.setAttribute("name", "menu-outline");
    menuIconWrapper.appendChild(menuIcon);

    menuIconWrapper.addEventListener("click", ()=>{
        toggleModalMenu();
    })

    const modalMenu = document.createElement("div");
    modalMenu.setAttribute("id", "modal-menu");

    const closeModal = document.createElement("div");
    closeModal.innerHTML = `
        <ion-icon name="close-outline"></ion-icon>
    `;
    closeModal.setAttribute("id", "close-modal");
    closeModal.addEventListener("click", ()=>{toggleModalMenu()});
    modalMenu.appendChild(closeModal);

    const buttons = [
        {
            text: "Domov",
            action: ()=> {window.location = `.${pageTitle !== "DPT" ? "." : ""}/index.html`},
        },
        {
            text: "Vaje",
            action: ()=> {window.location = `./${pageTitle !== "DPT" ? "" : "pages/"}lessons.html`},
        },
        {
            text: "Domače naloge",
            action: ()=>{window.location = `./${pageTitle !== "DPT" ? "" : "pages/"}homework.html`},
        },
        {
            text: userID !== "" ? "Profil" : "Prijava",
            action: ()=>{window.location = `./${pageTitle !== "DPT" ? "" : "pages/"}login.html`},
        },
        {
            text: "Info",
            action: ()=>console.log("informacije"),
        },
    ];

    buttons.forEach(item => {
        if(item.text === "Domače naloge" && userID !== "" && !userInfo.teacher || item.text !== "Domače naloge"){
            const buttonContainer = document.createElement("div");
            buttonContainer.innerText = item.text;
            buttonContainer.classList.add("modal-menu-options");
            buttonContainer.setAttribute("id", `${item.text}-option`);
            if(item.text === "Info"){
                buttonContainer.style.position = "absolute";
                buttonContainer.style.bottom = "100px";
            }
            buttonContainer.addEventListener("click", ()=>{
                item.action();
            });
            modalMenu.appendChild(buttonContainer);
        }
    })
    if(document.getElementById("main-header-title")){
        document.getElementById("main-header-title").remove();
    }
    const headerTitle = document.createElement("h1");
    headerTitle.setAttribute("id", "main-header-title");
    headerTitle.innerText = "Tipkanje";
    headerTitle.addEventListener("click", ()=> {window.location = `.${pageTitle !== "DPT" ? "." : ""}/index.html`});

    header.appendChild(menuIconWrapper);
    header.appendChild(modalMenu);
    header.appendChild(headerTitle);

}
