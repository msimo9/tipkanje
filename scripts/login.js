import {auth, db} from './firebase.js';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";
import { doc, setDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";
import { renderProfileScreen } from './profile.js';

let userID = "";

const checkIfLoggedIn = () =>{
    document.getElementById("main-container").innerHTML = "";
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            userID = uid;
            renderProfileScreen(uid);
        } else {
            document.title = "Prijava";
            renderFields();
        }
    });
}

const handleLogIn = (userData) =>{
    signInWithEmailAndPassword(auth, userData.email, userData.password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        // ...
        document.getElementById("main-container").innerHTML = "";
        //renderProfileScreen(user.uid);
    })
    .catch((error) => {
        document.getElementById("incorrect-info-warning").innerText = "Nepravilni prijavni podatki.";
        setTimeout(()=>{
            document.getElementById("incorrect-info-warning").innerText = "";
        }, 5000);
        const errorCode = error.code;
        const errorMessage = error.message;
    });
}

const addUserData = async(userID, userData, className) => {
    await setDoc(doc(db, "userInfo", userID), {
        userID: userID,
        email: userData.email,
        fullName: userData.fullName,
        code: userData.code,
        lessonsDone: [],
        timeSpentTyping: 0,
        class: className,
        profileImageURL: "https://firebasestorage.googleapis.com/v0/b/tipkanje-dc76d.appspot.com/o/userPhotos%2FdefaultPhoto.png?alt=media&token=5af3bf7d-d003-40b1-8260-08abfc6221c8",
    });
    window.location = "../pages/profile.html";
}

const getClass = async(uid, userData) =>{
    let classCodes = [];
    let className = "";
    const querySnapshot = await getDocs(collection(db, "classCodes"));
    querySnapshot.forEach((doc) => {
        if(doc.id.toString() === userData.code.toString()){
            className = doc.data().class;
        }
    });
    addUserData(uid, userData, className);
}

const createAccount = (userData) =>{
    createUserWithEmailAndPassword(auth, userData.email, userData.password)
    .then((userCredential) => {
        const user = userCredential.user;
        getClass(user.uid, userData);
        console.log("sign up successful!")
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, ": ", errorMessage);
    });
}

const formContainer = document.createElement("div");
formContainer.classList.add("login-form-container");

let userInfo = {
    email: "",
    password: "",
    passwordRepeat: "",
    fullName: "",
    code: "",
    profileImageURL: "https://firebasestorage.googleapis.com/v0/b/tipkanje-dc76d.appspot.com/o/userPhotos%2FdefaultPhoto.png?alt=media&token=5af3bf7d-d003-40b1-8260-08abfc6221c8",
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
        if(item !== "profileImageURL" && operation === "login" && index < 2 || operation === "signup" && index < 5){
            const inputFieldTitle = document.createElement("h3");

            function appendInfoCircle(){
                const infoDiv = document.createElement("div");
                infoDiv.setAttribute("id", "code-information-div");
                infoDiv.innerText = "Kodo ti priskrbi učitelijca ali učitelj. Brez pravilne in ustrezne kode registracija računa ni mogoča.";
                const infoIcon = document.createElement("ion-icon");
                infoIcon.setAttribute("name", "information-circle-outline");
                infoIcon.setAttribute("id", "code-information-icon");
                infoIcon.addEventListener("mouseenter", ()=>{
                    infoDiv.style.display = "flex";
                });
                infoIcon.addEventListener("mouseleave", ()=>{
                    infoDiv.style.display = "none";
                });
                inputFieldTitle.appendChild(infoIcon);
                inputFieldTitle.appendChild(infoDiv);
            }

            switch(index){
                case 0: inputFieldTitle.innerText = "Elektronski naslov"; break;
                case 1: inputFieldTitle.innerText = "Geslo"; break;
                case 2: inputFieldTitle.innerText = "Ponovi geslo"; break;
                case 3: inputFieldTitle.innerText = "Ime in priimek"; break;
                case 4: inputFieldTitle.innerHTML = "Koda"; appendInfoCircle(); break;
                default: break;
            }

            inputFieldsContainer.appendChild(inputFieldTitle);
            const inputField = document.createElement("input");
            inputField.addEventListener("keyup", ()=>{
                userInfo[item] = inputField.value; 
            });
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
    const warningMessage = document.createElement("div");
    warningMessage.setAttribute("id", "incorrect-info-warning");
    submitButton.appendChild(warningMessage);
    submitButton.addEventListener("click", ()=>{
        if(operation === "signup" && userInfo.password === userInfo.passwordRepeat && userInfo.email.includes("@os-ajdovscina.si") && userInfo.fullName.length !== 0 && userInfo.code.length !== 0 || operation==="login"){
            operation === "login" ? handleLogIn(userInfo) : createAccount(userInfo);
        }else{
            warningMessage.innerText = "Prosim, izpolni vsa polja pravilno.";
            setTimeout(()=>{
                warningMessage.innerText = "";
            }, 5000);
        }
        
    });
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

    document.getElementById("main-container").appendChild(formContainer);
}

//renderFields();
checkIfLoggedIn();