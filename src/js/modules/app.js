class App {
    constructor(message) {
        this.message = message;
    }

    greeting() {
        return "Hello!" + this.message;
    }
}

export default App;