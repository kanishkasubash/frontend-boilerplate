import App from './modules/app.js';

const app = new App("This is my Frontend Boilerplate");

document.getElementById("btnClick").onclick = function() {
    document.getElementById("message").innerHTML = app.greeting();
};
