import {auth, db, storage} from './firebase.js';
import { getAuth, signOut, onAuthStateChanged, updateEmail } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";
import { doc, getDoc, updateDoc, addDoc, setDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";
import {ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-storage.js";

let currentUser = undefined;
let userID = "";
let userInfo = undefined;
let readerResult = undefined;
let previewReaderResult = undefined;

const checkIfLoggedIn = () =>{
    document.getElementById("main-container").innerHTML = "";
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            currentUser = user;
            userID = uid;
            renderProfileScreen(userID);
        } else {

        }
    });
}

const handleChangeUserInfo = async(fullName, email) =>{
    const localAuth = getAuth();
    updateEmail(localAuth.currentUser, email);
    const updateRef = doc(db, "userInfo", userID);
    await updateDoc(updateRef, {
        fullName: fullName,
        email: email,
    });
}

const handleChangeClass = async(value1, value2) =>{
    const updateRef = doc(db, "userInfo", userID);
    await updateDoc(updateRef, {
        class: value1+""+value2,
    });
}

const handleSignOut = () =>{
    signOut(auth).then(() => {
        window.location = "../pages/login.html";
    }).catch((error) => {
        console.log(error);
    });
}

const updateImageUrl = async(url) =>{
    const updateRef = doc(db, "userInfo", userID);
    await updateDoc(updateRef, {
        profileImageURL: url,
    });
}

const addClass = async(allCodes, index, item) => {
    await setDoc(doc(db, "classCodes", item+"-"+allCodes[index].toString()), {
        code: allCodes[index].toString(),
        class: item,
        teacherCode: allCodes[99-index].toString(),
    });
}

const deleteClass = async(docID) =>{
    await deleteDoc(doc(db, "classCodes", docID));
}

const addCodesToFirebase = async(allCodes) =>{
    const querySnapshot = await getDocs(collection(db, "classCodes"));
    querySnapshot.forEach((doc) => {
        deleteClass(doc.id);
    });
    let allClasses = [];
    for(let i = 1; i <= 9; i++){
        for(let j = 0; j < 3; j++){
            allClasses.push(`${i}${j===0 ?"A" : j===1 ? "B" : "C" }`);
        }
    }
    allClasses.forEach((item, index) => {
        addClass(allCodes, index, item);
    });
}

const uploadPhoto = (file) =>{
    const uploadRef = ref(storage, `/userPhotos/${userID}`);
    uploadString(uploadRef, file, 'data_url').then((snapshot) => {
        getDownloadURL(ref(uploadRef))
        .then((url) => {
            document.getElementById("profile-screen-photo").setAttribute("src", url);
            document.getElementById("header-profile-photo").setAttribute("src", url);
            updateImageUrl(url);
        }).catch((error) => {
            console.log(error);
        });
    });
}

const handleFilePicker = () =>{
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => { 
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.addEventListener("load", function () {
            readerResult = reader.result;
            let image = new Image();
            image.src = reader.result;
            readerResult = reader.result;
            image.addEventListener("load", (e)=>{
                const canvas = document.createElement("canvas");
                let resizingFactor = 1;
                let imageWidth = image.width;
                let imageHeight = image.height;
                while (true){
                    if(
                        imageHeight * resizingFactor <= 400
                        ||
                        imageWidth * resizingFactor <= 400
                        ||
                        resizingFactor <= 0.2
                    ){
                            break;
                        }else{
                            resizingFactor -= 0.1;
                        }
                }

                imageWidth *= resizingFactor;
                imageHeight *= resizingFactor;

                canvas.width = imageWidth;
                canvas.height = imageHeight;

                canvas.getContext("2d").drawImage(image, 0, 0, imageWidth, imageHeight);

                const imageURL = canvas.toDataURL("image/jpeg");
                previewReaderResult = imageURL;
                uploadPhoto(previewReaderResult);
                
            });
        }, false);
        if (file) {
            reader.readAsDataURL(file);
        }
    }
    input.click();
}


export const renderProfileScreen = async(uid) =>{
    document.title = "Profil";
    userID = uid;
    const docRef = doc(db, "userInfo", userID);
    const docSnap = await getDoc(docRef);

    document.getElementById("main-container").innerHTML = "";

    if (docSnap.exists() && !docSnap.data().banned) {
        userInfo = docSnap.data();

        const profileScreenContainer = document.createElement("div");
        profileScreenContainer.classList.add("profile-screen-container");

        const profilePictureContainer = document.createElement("div");
        const rotatingDiv = document.createElement("div");
        profilePictureContainer.setAttribute("id", "profile-screen-photo-container")
        const profilePicture = document.createElement("img");
        profilePicture.setAttribute("src", userInfo.profileImageURL);
        profilePicture.setAttribute("id", "profile-screen-photo");
        profilePictureContainer.appendChild(rotatingDiv);
        profilePictureContainer.appendChild(profilePicture);
        profileScreenContainer.appendChild(profilePictureContainer);

        profilePicture.addEventListener("click", ()=>{
            handleFilePicker();
        });

        const userDataContainer = document.createElement("div");
        userDataContainer.classList.add("profile-screen-data-container");
        userDataContainer.innerHTML = `
            <h3>Pozdravljen/a, <b><i>${userInfo.fullName.split(" ")[0]}</i></b>!</h3>
            <div>
                <span>Ime in priimek: <b>${userInfo.fullName}</b></span> 
                <span>E-po??tni naslov: <b>${userInfo.email}</b></span> 
                <span>Razred: <b>${userInfo.class}</b></span> 
            </div>
        `;
        const changeInfoFields = document.createElement("div");
        changeInfoFields.style.width = userDataContainer.style.width;
        changeInfoFields.style.display = "none";
        changeInfoFields.setAttribute("id", "change-info-fields-modal");

        const hideModal = () =>{
            changeInfoFields.style.animation = "hideChangeInfoModal 500ms linear";
            changeInfoFields.innerHTML = "";
            setTimeout(()=>{
                changeInfoFields.style.display = "none";
                changeInfoFields.style.animation = "showChangeInfoModal 500ms linear";
            }, 500);
        }

        const closeModalIcon = document.createElement("div");
        closeModalIcon.innerHTML = "<ion-icon name='close-outline'></ion-icon>"
        closeModalIcon.setAttribute("id", "close-modal-outline");
        closeModalIcon.addEventListener("click", hideModal);
        //
        const changeInfo = document.createElement("h5");
        changeInfo.innerHTML = `Spremeni osebne podatke<ion-icon name="brush-outline" />`;
        changeInfo.addEventListener("click", ()=>{
            changeInfoFields.innerHTML = "";
            changeInfoFields.style.display = "flex";
            setTimeout(()=>{
            changeInfoFields.appendChild(closeModalIcon);
            //DIV TITLE
            const divTitle = document.createElement("h3");
                divTitle.innerText = "Spremeni podatke";
                changeInfoFields.appendChild(divTitle);
            //FULL NAME
            const inputTitle1 = document.createElement("h4");
            inputTitle1.innerText = "Ime in priimek:";
            const inputField1 = document.createElement("input");
            inputField1.setAttribute("placeholder", userInfo.fullName);
            changeInfoFields.appendChild(inputTitle1);
            changeInfoFields.appendChild(inputField1);
            //E-MAIL
            const inputTitle2 = document.createElement("h4");
            inputTitle2.innerText = "E-naslov:";
            const inputField2 = document.createElement("input");
            inputField2.setAttribute("placeholder", userInfo.email);
            changeInfoFields.appendChild(inputTitle2);
            changeInfoFields.appendChild(inputField2);

            const submitChanges = document.createElement("div");
            submitChanges.innerText = "Potrdi";
            submitChanges.classList.add("button");
            submitChanges.addEventListener("click", ()=>{
                handleChangeUserInfo(inputField1.value, inputField2.value);
                document.getElementById("main-container").innerHTML = "";
                renderProfileScreen(userID);
            });
            changeInfoFields.appendChild(submitChanges);
            }, 500);
        });
        const changeClass = document.createElement("h5");
        changeClass.innerHTML = `Spremeni razred<ion-icon name="people-outline" />`;
        changeClass.addEventListener("click", ()=>{
            changeInfoFields.innerHTML = "";
            changeInfoFields.style.display = "flex";
            setTimeout(()=>{
            changeInfoFields.appendChild(closeModalIcon);
            //DIV TITLE
            const divTitle = document.createElement("h3");
            divTitle.innerText = "Spremeni razred";
            changeInfoFields.appendChild(divTitle);
            //CLASS PICKER
            const dropdownOption = document.createElement("div");
            dropdownOption.classList.add("dropdown-class-picker");
            dropdownOption.style.flexDirection = "row";
            //userInfo.class
            let htmlDropdownText = "";
            htmlDropdownText += `<select name="razred" id="razred">`;
            for(let i=1; i<=9; i++){
                htmlDropdownText += 
                `<option
                    ${userInfo.class.substring(0,1).toString() === i.toString() ? "selected='selected'" : ""}
                    value="${i}">${i}
                </option>`
            }
            htmlDropdownText += `</select>;`;
            dropdownOption.innerHTML += htmlDropdownText;
            
            dropdownOption.innerHTML += `
            <select name="oddelek" id="oddelek">
                <option ${userInfo.class.substring(1,2).toString() === "A" ? "selected='selected'" : ""} value="A">A</option>
                <option ${userInfo.class.substring(1,2).toString() === "B" ? "selected='selected'" : ""} value="B">B</option>
                <option ${userInfo.class.substring(1,2).toString() === "C" ? "selected='selected'" : ""} value="C">C</option>
                <option ${userInfo.class.substring(1,2).toString() === "E" ? "selected='selected'" : ""} value="E">E</option>
            </select>
            `;

            changeInfoFields.appendChild(dropdownOption);
            //SUBMIT BUTTON
            const submitChanges = document.createElement("div");
            submitChanges.innerText = "Potrdi";
            submitChanges.classList.add("button");
            submitChanges.addEventListener("click", ()=>{
                handleChangeClass(document.getElementById("razred").value, document.getElementById("oddelek").value);
                document.getElementById("main-container").innerHTML = "";
                renderProfileScreen(userID);
            });
            changeInfoFields.appendChild(submitChanges);
            }, 500);
        });
        userDataContainer.appendChild(changeInfo);
        userDataContainer.appendChild(changeClass);
        userDataContainer.appendChild(changeInfoFields);
        profileScreenContainer.appendChild(userDataContainer);

        const signOutButton = document.createElement("div");
        signOutButton.classList.add("button");
        signOutButton.innerText = "Odjava";
        signOutButton.setAttribute("id","sign-out-button");
        signOutButton.addEventListener("click", ()=>{handleSignOut()});
        profileScreenContainer.appendChild(signOutButton);

        if(userInfo.admin || userInfo.teacher){
            const additionalContentContainer = document.createElement("div");
            additionalContentContainer.classList.add("additional-content-container");
            
            if(userInfo.teacher){
                additionalContentContainer.innerHTML += "<h3>Teacher portal</h3>";

                const addHomework = document.createElement("div");
                addHomework.classList.add("admin-action-text");
                addHomework.setAttribute("id", "add-homework");
                addHomework.innerHTML = "dodeli doma??o nalogo!";

                const showPupilActivity = document.createElement("div");
                showPupilActivity.classList.add("admin-action-text");
                showPupilActivity.setAttribute("id", "show-pupil-activity");
                showPupilActivity.innerHTML = "preglej aktivnost u??encev!";

                const seeAndManagePupils = document.createElement("div");
                seeAndManagePupils.classList.add("admin-action-text");
                seeAndManagePupils.innerHTML = "preglej in upravljaj u??ence!";
                seeAndManagePupils.setAttribute("id", "see-manage-pupils");

                additionalContentContainer.appendChild(addHomework);
                additionalContentContainer.appendChild(showPupilActivity);
                additionalContentContainer.appendChild(seeAndManagePupils);
            }


            if(userInfo.admin){
                additionalContentContainer.innerHTML += "<h3>Admin portal</h3>";

                const openAdminPage = (option) =>{
                    window.location = `./admin.html?option=${option}`;
                }

                const allTeachersText = document.createElement("div");
                allTeachersText.classList.add("admin-action-text");
                allTeachersText.innerHTML = "preglej vse u??itelje!";
                allTeachersText.addEventListener("click", ()=>{
                    openAdminPage(1);
                });
                const allPupilsText = document.createElement("div");
                allPupilsText.classList.add("admin-action-text");
                allPupilsText.innerHTML = "preglej vse u??ence!";
                allPupilsText.addEventListener("click", ()=>{
                    openAdminPage(2);
                });

                const generateCodesText = document.createElement("div");
                generateCodesText.classList.add("admin-action-text");
                generateCodesText.innerHTML = "generiraj nove kode!";

                const generateNewCodes = () =>{
                    let codes = [];
                    let availableChars = "WERTZUIOPASDFGHJKLYXCVBNM1234567890";
                    for(let i=0; i < 100; i++){
                        let newCode = "";
                        for(let j=0; j<8; j++){
                            newCode += availableChars.charAt(Math.floor(Math.random()*availableChars.length + 0));
                        }
                        if(codes.indexOf(newCode) === -1){
                            codes.push(newCode);
                        }else{
                            i--;
                        }
                    }
                    addCodesToFirebase(codes);
                }
                generateCodesText.addEventListener("click", ()=>{
                    generateNewCodes();
                });

                additionalContentContainer.appendChild(allTeachersText);
                additionalContentContainer.appendChild(allPupilsText);
                additionalContentContainer.appendChild(generateCodesText);
            }

            profileScreenContainer.appendChild(additionalContentContainer);
        }

        document.getElementById("main-container").appendChild(profileScreenContainer);

        const openTeacherPage = (option) => {
            window.location = `./teacher.html?option=${option}`;
        }
        if(userInfo.teacher){
            document.getElementById("add-homework").addEventListener("click", ()=>{
                openTeacherPage(1);
            });
            document.getElementById("show-pupil-activity").addEventListener("click", ()=>{
                openTeacherPage(2);
            });
            document.getElementById("see-manage-pupils").addEventListener("click", ()=>{
                openTeacherPage(3);
            });
        }
    }
}

checkIfLoggedIn();