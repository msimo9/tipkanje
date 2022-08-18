const formContainer = document.createElement("div");
formContainer.classList.add("login-form-container");

let userInfo = {
    email: "",
    password: "",
    passwordRepeat: "",
    fullName: "",
    code: "",
}

let operation = "login";

const renderFields = () =>{
    formContainer.innerHTML = "";
    //__________________TITLE_____________________
    const titleContainer = document.createElement("div");
    titleContainer.classList.add("login-form-title-container");
    titleContainer.innerHTML = `<h1>${operation === "login" ? "Prijava" : "Registracija"}</h1>`;

    formContainer.appendChild(titleContainer);
    //__________________INPUT FIELDS_____________________
    const inputFieldsContainer = document.createElement("div");
    inputFieldsContainer.classList.add("form-input-fields-container");

    Object.keys(userInfo).forEach((item, index) => {
        if(operation === "login" && index < 2 || operation === "signup"){
            const inputFieldTitle = document.createElement("h3");
            switch(index){
                case 0: inputFieldTitle.innerText = "Elektronski naslov"; break;
                case 1: inputFieldTitle.innerText = "Geslo"; break;
                case 2: inputFieldTitle.innerText = "Ponovi geslo"; break;
                case 3: inputFieldTitle.innerText = "Ime in priimek"; break;
                case 4: inputFieldTitle.innerText = "Koda"; break;
                default: break;
            }
            inputFieldsContainer.appendChild(inputFieldTitle);
            const inputField = document.createElement("input");
            if(index === 1 || index === 2){
                const passwordWrapper = document.createElement("div");
                inputField.setAttribute("type", "password");
                const eyeIcon = document.createElement("ion-icon");
                eyeIcon.setAttribute("name", "eye-outline");
                eyeIcon.setAttribute("id", "toggle-password-visibility");
                eyeIcon.addEventListener("click", ()=>{
                    if(eyeIcon.getAttribute("name") === "eye-outline"){
                        eyeIcon.setAttribute("name", "eye-off-outline");
                        inputField.setAttribute("type", "text");
                    }else{
                        eyeIcon.setAttribute("name", "eye-outline");
                        inputField.setAttribute("type", "password");
                    }
                });
                inputField.style.marginBottom = "0px";
                passwordWrapper.appendChild(eyeIcon);
                passwordWrapper.appendChild(inputField);
                inputFieldsContainer.appendChild(passwordWrapper);
            }else{
                inputFieldsContainer.appendChild(inputField);
            }
        }
    });
    formContainer.appendChild(inputFieldsContainer);

    //__________________SUBMIT BUTTON_____________________

    const submitButton = document.createElement("div");
    submitButton.classList.add("form-submit-button");
    submitButton.innerText = operation === "login" ? "Prijava" : "Registracija";
    formContainer.appendChild(submitButton);


    //__________________CHANGE OPERATION_____________________
    const changeOperationContainer = document.createElement("div");
    changeOperationContainer.classList.add("change-operation-container");
    changeOperationContainer.innerText = operation === "login" ? "Še nimaš računa?" : "Že imaš račun?";
    const changeOperationText = document.createElement("b");
    changeOperationText.innerText = operation === "login" ? "Ustvari ga tukaj!" : "Prijavi se!";
    changeOperationText.addEventListener("click",()=>{
        if(operation === "signup"){
            operation = "login";
        }else{
            operation = "signup";
        }
        renderFields();
    });
    changeOperationContainer.appendChild(changeOperationText);
    formContainer.appendChild(changeOperationContainer);

    document.body.appendChild(formContainer);
}

renderFields();