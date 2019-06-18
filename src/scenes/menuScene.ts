import { Scene, GameObjects, Input } from "phaser";

export class MenuScene extends Scene {
    title: GameObjects.Text;
    hint: GameObjects.Text;

    constructor() {
        super({
            key: "MenuScene"
        });
    }
    
    init(): void {
    }

    create(): void {
        this.title = this.add.text(320, Number(this.game.config.height)/2 - 100, 'NTSD', { font: '128px Arial Bold', fill: '#222cbf' });
        this.hint = this.add.text(330, Number(this.game.config.height)/2 + 40, 'Press ESCAPE to start or return', { font: '24px Arial Bold', fill: '#222cbf' });
    }

    update(): void {
        if (Input.Keyboard.JustDown(this.input.keyboard.addKey('ESC'))) {
            this.scene.start("GameScene");
        }
    }
};