const header = document.getElementById("header");

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

const closeModal = document.createElement("ion-icon");
closeModal.setAttribute("name", "close-outline");
closeModal.setAttribute("id", "close-modal");
closeModal.addEventListener("click", ()=>{toggleModalMenu()});
modalMenu.appendChild(closeModal);

const pageTitle = document.title;

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
        text: "Prijava",
        action: ()=>console.log("prijava"),
    },
    {
        text: "Registracija",
        action: ()=>console.log("registracija"),
    },
    {
        text: "Info",
        action: ()=>console.log("informacije"),
    },
];

buttons.forEach(item => {
    const buttonContainer = document.createElement("div");
    buttonContainer.innerText = item.text;
    buttonContainer.classList.add("modal-menu-options");
    if(item.text === "Info"){
        buttonContainer.style.position = "absolute";
        buttonContainer.style.bottom = "100px";
    }
    buttonContainer.addEventListener("click", ()=>{
        item.action();
    });
    modalMenu.appendChild(buttonContainer);
})

const headerTitle = document.createElement("h1");
headerTitle.innerText = "Tipkanje";

const loginWrapper = document.createElement("div");
loginWrapper.setAttribute("id", "loggin-wrapper");
loginWrapper.innerHTML = "<span>Prijavi se!</span>";

header.appendChild(menuIconWrapper);
header.appendChild(modalMenu);
header.appendChild(headerTitle);
header.appendChild(loginWrapper);