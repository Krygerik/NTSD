import { Scene, GameObjects, Input } from "phaser";

export class MenuScene extends Scene {
    title: GameObjects.Text;
    hint: GameObjects.Text;
    helpFirstHero: GameObjects.Text;
    helpSecondHero: GameObjects.Text;

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
        this.helpFirstHero = this.add.text(0, 20, '', { font: '20px Arial Bold', fill: '#222cbf' });
        this.helpSecondHero = this.add.text(600, 20, '', { font: '20px Arial Bold', fill: '#222cbf' });
    }

    update(): void {
        this.helpFirstHero.setText(`
            FIRST HERO:
            A - move left, D - move right
            W - jump, S - block
            Q - attack, SPACE - take/throw`
        )
        this.helpSecondHero.setText(`
            SECOND HERO:
            LEFT - move left, RIGHT - move right
            UP - jump, DOWN - block
            CTRL - attack, ENTER - take/throw`
        )

        if (Input.Keyboard.JustDown(this.input.keyboard.addKey('ESC'))) {
            this.scene.start("GameScene");
        }
    }
};