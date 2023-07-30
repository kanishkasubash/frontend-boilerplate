class App {
    constructor(message) {
        this.message = message;
    }

    greeting() {
        var element = document.getElementById("top-heading");
        if (element.className == "success") {
            element.className = "warning";
            return "WARN! " + this.message;
        } else {
            element.className = "success";
            return "OK. " + this.message;
        }
    }
}

export default App;