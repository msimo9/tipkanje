import {auth, db} from './firebase.js';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";
import { doc, setDoc, getDocs, collection, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";
import { renderProfileScreen } from './profile.js';

let userID = "";
let teacherCheckboxValue = false;
let isUserBanned = false;

const checkIfLoggedIn = () =>{
    document.getElementById("main-container").innerHTML = "";
    onAuthStateChanged(auth, (user) => {
        if (user && !isUserBanned) {
            const uid = user.uid;
            userID = uid;
            renderProfileScreen(uid);
        } else {
            document.title = "Prijava";
            renderFields();
        }
    });
}

const handleSignOut = () =>{
    signOut(auth).then(() => {
        window.location = "../pages/login.html";
    }).catch((error) => {
        console.log(error);
    });
}

const checkIfBanned = async(userID) => {
    const docRef = doc(db, "userInfo", userID.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      if(docSnap.data().banned){
        isUserBanned = true;
        handleSignOut();
      }else{
        isUserBanned = false;
      }
    }
}

const updateLastOnline = async(userID) =>{
    const dateOnline = new Date();
    const lastOnlineRef = doc(db, "userInfo", userID);
    await updateDoc(lastOnlineRef, {
        lastOnline: dateOnline.getTime(),
    });
}

const handleLogIn = (userData) =>{
    signInWithEmailAndPassword(auth, userData.email, userData.password)
    .then((userCredential) => {
        const user = userCredential.user;
        document.getElementById("main-container").innerHTML = "";
        checkIfBanned(user.uid);
        updateLastOnline(user.uid);
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
    const dateOnline = new Date();
    await setDoc(doc(db, "userInfo", userID), {
        userID: userID,
        email: userData.email,
        fullName: userData.fullName,
        code: userData.code,
        lessonsDone: [],
        teacher: teacherCheckboxValue === true && userData.code === "123456ABC" ? true : false,
        timeSpentTyping: 0,
        class: userData.class,
        lastOnline: dateOnline.getTime(),
        profileImageURL: "https://firebasestorage.googleapis.com/v0/b/tipkanje-dc76d.appspot.com/o/userPhotos%2FdefaultPhoto.png?alt=media&token=5af3bf7d-d003-40b1-8260-08abfc6221c8",
    });
    const classUpdateRef = doc(db, "classInformation", userData.class.toString());
    await updateDoc(classUpdateRef, {
        pupils: arrayUnion(userID)
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
    class: "",
    code: "",
    profileImageURL: "https://firebasestorage.googleapis.com/v0/b/tipkanje-dc76d.appspot.com/o/userPhotos%2FdefaultPhoto.png?alt=media&token=5af3bf7d-d003-40b1-8260-08abfc6221c8",
    
}

const changeClass = (value1, value2) => {
    userInfo["class"] = value1+""+value2;
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
        if(item !== "profileImageURL" && operation === "login" && index < 2 || operation === "signup" && index < 6){

            if(operation === "signup" && index === 5){
                const inputFieldTitle = document.createElement("h3");
                inputFieldTitle.innerText = "Učitelj?"
                const teacherCheckbox = document.createElement("input");
                teacherCheckbox.setAttribute("type", "checkbox");
                teacherCheckbox.setAttribute("id", "teacher-checkbox");
                teacherCheckbox.addEventListener("click", ()=>{
                    teacherCheckboxValue = teacherCheckbox.checked;
                    if(teacherCheckbox.checked){
                        document.getElementById("code-field-title").style.display = "flex";
                        document.getElementById("code-field").style.display = "flex";
                    }else{
                        document.getElementById("code-field-title").style.display = "none";
                        document.getElementById("code-field").style.display = "none";
                    }
                })
                inputFieldsContainer.appendChild(inputFieldTitle);
                inputFieldsContainer.appendChild(teacherCheckbox);
            }

            const inputFieldTitle = document.createElement("h3");

            switch(index){
                case 0: inputFieldTitle.innerText = "Elektronski naslov"; break;
                case 1: inputFieldTitle.innerText = "Geslo"; break;
                case 2: inputFieldTitle.innerText = "Ponovi geslo"; break;
                case 3: inputFieldTitle.innerText = "Ime in priimek"; break;
                case 4: inputFieldTitle.innerHTML = "Razred"; break;
                case 5: inputFieldTitle.innerHTML = "Koda"; break;
                default: break;
            }
            if(index === 5){
                inputFieldTitle.setAttribute("id", "code-field-title");
                inputFieldTitle.style.display = "none";
            }
            inputFieldsContainer.appendChild(inputFieldTitle);
            
            const inputField = document.createElement("input");
            inputField.addEventListener("keyup", ()=>{
                userInfo[item] = inputField.value; 
            });
            if(index === 1 || index === 2){
                const passwordWrapper = document.createElement("div");
                inputField.setAttribute("type", "password");
                /*const eyeIcon = document.createElement("ion-icon");
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
                });*/
                inputField.style.marginBottom = "0px";
                //passwordWrapper.appendChild(eyeIcon);
                passwordWrapper.appendChild(inputField);
                inputFieldsContainer.appendChild(passwordWrapper);
            }else{
                if(index === 5){
                    inputField.setAttribute("id", "code-field");
                    inputField.style.display = "none";
                }
                if(index !== 4){
                    inputFieldsContainer.appendChild(inputField);
                }else{
                    const dropdownOption = document.createElement("div");
                    dropdownOption.addEventListener("change", ()=>{
                        changeClass(document.getElementById("razred").value, document.getElementById("oddelek").value)
                    });
                    dropdownOption.classList.add("dropdown-class-picker");
                    dropdownOption.innerHTML += `
                    <select name="razred" id="razred">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                    </select>
                    `;
                    
                    dropdownOption.innerHTML += `
                    <select name="oddelek" id="oddelek">
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="E">E</option>
                    </select>
                    `;
                    inputFieldsContainer.appendChild(dropdownOption);
                }
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
        if(operation === "signup" && userInfo.password === userInfo.passwordRepeat && userInfo.email.includes("@os-ajdovscina.si") && userInfo.fullName.length !== 0 || operation==="login"){
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