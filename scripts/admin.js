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

const subcontentContainer = document.createElement("div");
subcontentContainer.classList.add("admin-content-subcontent");

const renderContent = () =>{
    if(selectedOption === "1"){
        renderAllTeachers();
    }else if(selectedOption === "2"){
        renderAllPupils();
    }
}

const renderAllTeachers = () =>{
    title.innerText = "Učitelji";
    contentWrapper.appendChild(title);

    searchField.setAttribute("placeholder", "Vnesi ime učitelja...");
    searchFieldWrapper.appendChild(searchField);
    contentWrapper.appendChild(searchFieldWrapper);

    subcontentContainer.innerText = "Vsi učitelji bodo tukaj...";
    contentWrapper.appendChild(subcontentContainer);

    document.body.appendChild(contentWrapper);
}

const renderAllPupils = () =>{
    title.innerText = "Učenci";
    contentWrapper.appendChild(title);

    searchField.setAttribute("placeholder", "Vnesi ime učenca...");
    searchFieldWrapper.appendChild(searchField);
    contentWrapper.appendChild(searchFieldWrapper);

    subcontentContainer.innerText = "Vsi učenci bodo tukaj...";
    contentWrapper.appendChild(subcontentContainer);    

    mainContainer.appendChild(contentWrapper);
}

renderContent();