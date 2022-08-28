const openedURL = new URL(window.location.href);
const selectedOption = openedURL.searchParams.get("option");

console.log("selected option: ", selectedOption);