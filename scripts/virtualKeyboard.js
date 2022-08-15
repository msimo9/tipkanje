const keyboardKeys = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "'", "+"],
    ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P", "Š", "Đ"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Č", "Ć", "Ž"],
    ["Y", "X", "C", "V", "B", "N", "M", ",", ".", "-"],
];

const keyboardContainer = document.getElementById("keyboard-container");

const virtualKeyboardContainer = document.createElement("div");
virtualKeyboardContainer.classList.add("virtual-keyboard-container");
virtualKeyboardContainer.setAttribute("id", "virtual-keyboard-container");

keyboardKeys.map((item, index1) => {
    const keyboardRow = document.createElement("div");
    keyboardRow.classList.add("virtual-keyboard-row");
    switch(index1){
        case 0: keyboardRow.style.paddingLeft = "0px"; break;
        case 1: keyboardRow.style.paddingLeft = "25px"; break;
        case 2: keyboardRow.style.paddingLeft = "40px"; break;
        case 3: keyboardRow.style.paddingLeft = "60px"; break;
        default: break;
    }

    item.map((subitem, index2) => {
        const keyboardKey = document.createElement("div");
        keyboardKey.classList.add("virtual-keyboard-key");
        keyboardKey.innerText = subitem;
        if(subitem.toUpperCase() === "F" || subitem.toUpperCase() === "J"){
            keyboardKey.style.textDecoration = "underline";
        }
        keyboardKey.setAttribute("id", "key-"+subitem.toString());

        keyboardRow.appendChild(keyboardKey);
    })

    virtualKeyboardContainer.appendChild(keyboardRow);
});

keyboardContainer.appendChild(virtualKeyboardContainer);

window.addEventListener("keydown", (e)=>{
    const renderedKey = document.getElementById("key-"+(e.key).toUpperCase());
    if(renderedKey !== null){
        renderedKey.style.backgroundColor = "#2C3333";
        renderedKey.style.color = "#A5C9CA";
    }
});

window.addEventListener("keyup", (e)=>{
    const renderedKey = document.getElementById("key-"+(e.key).toUpperCase());
    if(renderedKey !== null){
        renderedKey.style.backgroundColor = "#A5C9CA";
        renderedKey.style.color = "#2C3333";
    }
});

const handleToggleKeyboard = () =>{
    const keyboardContainer = document.getElementById("keyboard-container");
    const closeKeyboardIcon = document.getElementById("toggle-keyboard-icon");
    if(keyboardContainer.style.display == "flex"){
        keyboardContainer.style.display = "none";
        closeKeyboardIcon.style.display = "flex";
    }else if(keyboardContainer.style.display == "none"){
        keyboardContainer.style.display = "flex";
        closeKeyboardIcon.style.display = "none";
    }else{
        keyboardContainer.style.display = "none";
        closeKeyboardIcon.style.display = "flex";
    }
}

const toggleKeyboardContainer = document.createElement("div");
toggleKeyboardContainer.classList.add("toggle-virtual-keyboard");

const keyboardIcon = document.createElement("img");
keyboardIcon.setAttribute("src", "../assets/favicon2.png");

const closeIcon = document.createElement("ion-icon");
closeIcon.setAttribute("name", "close-outline");
closeIcon.setAttribute("id", "toggle-keyboard-icon");

keyboardIcon.addEventListener("click", ()=>{
    handleToggleKeyboard();
});

closeIcon.addEventListener("click", ()=>{
    handleToggleKeyboard();
});

toggleKeyboardContainer.appendChild(closeIcon);
toggleKeyboardContainer.appendChild(keyboardIcon);

document.body.appendChild(toggleKeyboardContainer);