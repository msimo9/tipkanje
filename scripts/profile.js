import {auth, db, storage} from './firebase.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";
import {ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-storage.js";

let userID = "";
let userInfo = undefined;
let readerResult = undefined;
let previewReaderResult = undefined;

const checkIfLoggedIn = () =>{
    document.getElementById("main-container").innerHTML = "";
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            userID = uid;
        } else {

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

const updateImageUrl = async(url) =>{

    console.log(userID);
    const updateRef = doc(db, "userInfo", userID);
    await updateDoc(updateRef, {
        profileImageURL: url,
    });
}

const uploadPhoto = (file) =>{
    const uploadRef = ref(storage, `/userPhotos/${userID}`);
    uploadString(uploadRef, file, 'data_url').then((snapshot) => {
        console.log("profile pic uploaded!");
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

    if (docSnap.exists()) {
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

        profilePictureContainer.addEventListener("click", ()=>{
            handleFilePicker();
        });

        const userDataContainer = document.createElement("div");
        userDataContainer.classList.add("profile-screen-data-container");
        userDataContainer.innerHTML = `
            <h3>Pozdravljen/a, <b><i>${userInfo.fullName.split(" ")[0]}</i></b>!</h3>
            <div>
                <span>Ime in priimek: <b>${userInfo.fullName}</b></span> 
                <span>E-poštni naslov: <b>${userInfo.email}</b></span> 
                <span>Razred: <b>3. b</b></span> 
            </div>
        `;
        const changeInfoFields = document.createElement("div");
        changeInfoFields.setAttribute("id", "change-info-fields-modal");
        const closeModalIcon = document.createElement("ion-icon");
        closeModalIcon.setAttribute("name", "close-outline");
        closeModalIcon.addEventListener("click", ()=>{
            changeInfoFields.style.animation = "hideChangeInfoModal 500ms linear";
            setTimeout(()=>{
                changeInfoFields.style.display = "none";
                changeInfoFields.style.animation = "showChangeInfoModal 500ms linear";
            }, 500);
        });
        changeInfoFields.appendChild(closeModalIcon);


        const changeInfo = document.createElement("h5");
        changeInfo.innerHTML = `Uredi osebne podatke<ion-icon name="brush-outline" />`;
        changeInfoFields.style.width = userDataContainer.style.width;
        changeInfo.addEventListener("click", ()=>{
            changeInfoFields.style.display = "flex";
        });
        const changeClass = document.createElement("h5");
        changeClass.innerHTML = `Spremeni razred<ion-icon name="people-outline" />`;
        changeClass.addEventListener("click", ()=>{

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


        document.getElementById("main-container").appendChild(profileScreenContainer);
    }
}