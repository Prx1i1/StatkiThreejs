import Game from "./Game.js"
import Net from "./Net.js"
import UI from "./UI.js"

window.onload = () => {
    window.game = new Game();
    window.net = new Net();
    window.ui = new UI(game,net);
}