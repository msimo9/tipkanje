import {exercises} from './exercises.js';

const lessonsContainer = document.createElement("div");
lessonsContainer.classList.add("lessons-container");

exercises.map(item => {
    const lessonWrapper = document.createElement("div");
    lessonWrapper.classList.add("lesson-wrapper");

    const lessonIcon = document.createElement("ion-icon");
        lessonIcon.setAttribute("name", item.icon);
    const lessonTitleContainer = document.createElement("div");
        lessonTitleContainer.classList.add("lesson-title-container")
    const lessonTitle = document.createElement("h2");
        lessonTitle.innerText = item.title;
    const lessonSubtitle = document.createElement("h3");
        lessonSubtitle.innerText = item.subtitle;

    lessonTitleContainer.appendChild(lessonTitle);
    lessonTitleContainer.appendChild(lessonSubtitle);
    
    lessonWrapper.appendChild(lessonIcon);
    lessonWrapper.appendChild(lessonTitleContainer);

    const charsPreviewWrapper = document.createElement("div");
    charsPreviewWrapper.classList.add("chars-preview-wrapper");
    charsPreviewWrapper.innerText = item.sampleChars;

    lessonWrapper.addEventListener("mouseenter", ()=>{
        charsPreviewWrapper.style.transition = "all 300ms linear";
        charsPreviewWrapper.style.display = "flex";
    })
    lessonWrapper.addEventListener("mouseleave", ()=>{
        charsPreviewWrapper.style.transition = "all 300ms linear";
        charsPreviewWrapper.style.display = "none";
    })
    lessonWrapper.appendChild(charsPreviewWrapper);

    lessonWrapper.addEventListener("click", ()=>{
        const timeAdded = new Date();
        localStorage.setItem("timeAdded", timeAdded.getTime());
        localStorage.setItem("exercises", item.data.join());
        window.location = "../index.html";
    });

    lessonsContainer.appendChild(lessonWrapper);
});


document.body.appendChild(lessonsContainer);