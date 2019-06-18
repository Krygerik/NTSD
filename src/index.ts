import {Types, Game} from "phaser";
import {GameScene} from "./scenes/gameScene/gameScene";
import {MenuScene} from "./scenes/menuScene";

const config: Types.Core.GameConfig = {
    title: "NTSD",
    width: 1000,
    height: 450,
    parent: "game",
    scene: [new MenuScene(), new GameScene()],
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 500 },
            debug: true
        }
    },
    backgroundColor: "#c8d8f4"
};

class TestGame extends Game {
    constructor(config: Types.Core.GameConfig) {
        super(config);
    }
}

new TestGame(config);
