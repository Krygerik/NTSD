import {Scene, GameObjects} from "phaser";

export class HealthBar {
    constructor (scene: Scene, x: number, y: number, icon: string) {
        this.bar = new GameObjects.Graphics(scene);
        this.x = x;
        this.y = y;
        this.value = 100;
        this.p = 96/100;
        
        this.draw();
        
        scene.add.existing(this.bar);

        scene.add.image(this.x + 39, this.y + 37, icon).setDisplaySize(51, 51);
        scene.add.text(this.x + 100, this.y + 25, 'Health', { font: '15px Courier', fill: '#ffff55' });
    }

    public bar: GameObjects.Graphics;
    public x: number;
    public y: number;
    public value: number;
    public p: number;
    public heroIcon: GameObjects.Image;

    draw(): void {
        this.bar.clear();
        //  BG
        this.bar.fillStyle(0x4a677a);
        this.bar.fillRect(this.x, this.y, 200, 75);
        // bg icon
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x + 10, this.y + 10, 55, 55);
        // border icon
        this.bar.fillStyle(0x4a677a);
        this.bar.fillRect(this.x + 12, this.y + 12, 51, 51);

        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x + 80, this.y + 45, 100, 16);
        //  Health
        this.bar.fillStyle(0x4a677a);
        this.bar.fillRect(this.x + 82, this.y + 47, 96, 12);
        if (this.value < 30) {
            this.bar.fillStyle(0xff0000);
        } else {
            this.bar.fillStyle(0x00ff00);
        }
        var d = Math.floor(this.p * this.value);
        this.bar.fillRect(this.x + 82, this.y + 47, d, 12);
    }

    decrease(amount: number): boolean {
        this.value -= amount;
        if (this.value < 0) {
            this.value = 0;
        }
        this.draw();

        return (this.value === 0);
    }
}