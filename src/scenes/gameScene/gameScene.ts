import { Types, Scene, Physics, Actions, Geom, Input } from "phaser";
import * as enums from "./enums";
import {HealthBar} from "./utills/healthBar";
import checkOverlap from "./utills/checkOverlap";

export class GameScene extends Scene {
    hero: Physics.Arcade.Sprite;
    secondHero: Physics.Arcade.Sprite;
    kunai: Physics.Arcade.Sprite;

    // map elements
    ground: Physics.Arcade.StaticGroup;
    floor: Physics.Arcade.StaticGroup;
    floor2: Physics.Arcade.StaticGroup;
    wall: Physics.Arcade.StaticGroup;
    wall2: Physics.Arcade.StaticGroup;
    background: Physics.Arcade.StaticGroup;

    // combos
    comboForRunRight: number[] = [Input.Keyboard.KeyCodes.RIGHT, Input.Keyboard.KeyCodes.RIGHT];
    comboForRunLeft: number[] = [Input.Keyboard.KeyCodes.LEFT, Input.Keyboard.KeyCodes.LEFT];
    comboForAttackLeft: number[] = [Input.Keyboard.KeyCodes.LEFT, Input.Keyboard.KeyCodes.CTRL, Input.Keyboard.KeyCodes.LEFT];
    comboForAttackRight: number[] = [Input.Keyboard.KeyCodes.RIGHT, Input.Keyboard.KeyCodes.CTRL, Input.Keyboard.KeyCodes.RIGHT];

    constructor() {
        super({
            key: "GameScene"
        });
    }

    preload(): void {
        // this.load.path = "../assets/sheets/";
        this.load.baseURL = "https://raw.githubusercontent.com/Krygerik/NTSD/master/assets/sheets/";
        this.load.image(enums.KeysLoadResources.FLOOR, "floor.jpg");
        this.load.image(enums.KeysLoadResources.GROUND, "ground.png");
        this.load.image(enums.KeysLoadResources.BACKGROUND, "background.jpg");
        this.load.image(enums.KeysLoadResources.ICON, 'naruto_icon.png');
        this.load.spritesheet(
            enums.KeysLoadResources.KUNAI,
            "kunai_sheet.png",
            { frameWidth: 20, frameHeight: 20, startFrame: 0, endFrame: 1 }
        );
        this.load.spritesheet(
            enums.KeysLoadResources.STAND,
            "stand.png",
            { frameWidth: 50, frameHeight: 51, startFrame: 0, endFrame: 3 }
        );
        this.load.spritesheet(
            enums.KeysLoadResources.WALK,
            "walk.png",
            { frameWidth: 50, frameHeight: 52, startFrame: 0, endFrame: 5 }
        );
        this.load.spritesheet(
            enums.KeysLoadResources.JUMP,
            "jump.png",
            { frameWidth: 50, frameHeight: 53, startFrame: 0, endFrame: 3 }
        );
        this.load.spritesheet(
            enums.KeysLoadResources.ATTACK,
            "attack.png",
            { frameWidth: 52, frameHeight: 50, startFrame: 0, endFrame: 2 }
        );
        this.load.spritesheet(
            enums.KeysLoadResources.BLOCK,
            "block.png",
            { frameWidth: 50, frameHeight: 50, startFrame: 0, endFrame: 1 }
        );
        this.load.spritesheet(
            enums.KeysLoadResources.THROW,
            "throw.png",
            { frameWidth: 52, frameHeight: 50, startFrame: 0, endFrame: 2 }
        );
        this.load.spritesheet(
            enums.KeysLoadResources.DIED,
            "died.png",
            { frameWidth: 53, frameHeight: 50, startFrame: 0, endFrame: 1 }
        );
        this.load.spritesheet(
            enums.KeysLoadResources.DAMAGED,
            "damaged.png",
            { frameWidth: 50, frameHeight: 51, startFrame: 0, endFrame: 0 }
        );
    }

    create(): void {
        this.createWorld();
        this.createAnims();

        this.hero = this.createPerson(600, 200, 'CTRL', 'ENTER', 'LEFT', 'RIGHT', 'UP', 'DOWN');
        this.secondHero = this.createPerson(300, 200, 'Q', 'SPACE', 'A', 'D', 'W', 'S');
        this.hero.data.values.healthBar = new HealthBar(this, 800, 0, enums.KeysLoadResources.ICON);
        this.secondHero.data.values.healthBar = new HealthBar(this, 0, 0, enums.KeysLoadResources.ICON);

        this.kunai = this.physics.add.sprite(400, 290, enums.KeysLoadResources.KUNAI, 1);
        this.kunai.setCollideWorldBounds(true);
        this.kunai.setDebug(true, true, 0xffff55);
        this.kunai.play(enums.KeysAnimationsItems.TAKED);

        this.floor = this.physics.add.staticGroup({
            key: enums.KeysLoadResources.FLOOR,
            frameQuantity: 9
        });
        Actions.PlaceOnLine(this.floor.getChildren(), new Geom.Line(59, 347, 1070, 347));
        this.floor.refresh();

        this.physics.add.collider(this.floor, [this.hero, this.secondHero]);
        this.physics.add.collider(this.kunai, this.floor, this.fallenKunai, null, this);
        this.physics.add.collider(this.kunai, [this.hero, this.secondHero], this.kunaiDamagedHero, null, this);


        this.input.keyboard.on('keydown', this.handlerKeysDown, this)
        this.input.keyboard.on('keyup', this.handlerKeysUp, this)
        this.hero.on('animationcomplete', this.handlerAnimationComplete);
        this.secondHero.on('animationcomplete', this.handlerAnimationComplete);
    }

    update(): void {
        this.actionHero(this.hero, this.secondHero);
        this.actionHero(this.secondHero, this.hero);
    }

    actionHero(hero, enemy) {
        if (hero.state !== enums.PlayerState.DIED) {
            if (hero.body.touching.down) {
                if (hero.state !== enums.PlayerState.STAND && hero.state !== enums.PlayerState.BLOCK && hero.state !== enums.PlayerState.ATTACK) {
                    if (hero.body.velocity.x === 0 && hero.body.velocity.y === 0) {
                        hero
                            .setState(enums.PlayerState.STAND)
                            .play(enums.KeysAnimationsNaruto.STAND)
                    }
                    if (hero.state === enums.PlayerState.JUMP || hero.state === enums.PlayerState.FALLEN) {
                        hero
                            .setVelocity(0, 0)
                            .setState(enums.PlayerState.STAND)
                            .play(enums.KeysAnimationsNaruto.STAND)
                    }
                }
            }

            if (Input.Keyboard.JustDown(hero.data.values.keyAttack)) {
                hero
                    .setState(enums.PlayerState.ATTACK)
                    .play(enums.KeysAnimationsNaruto.ATTACK);

                if (checkOverlap(hero, enemy)) {
                    const directionAttack = hero.flipX ? enums.DirectionAttack.LEFT : enums.DirectionAttack.RIGHT,
                        damage: number = 5;

                    this.heroGetDamage(enemy, damage, directionAttack)
                }
            }

            if (Input.Keyboard.JustDown(hero.data.values.keyTake)) {
                if (!!hero.data.values.withWeapon) {
                    hero.anims.play(enums.KeysAnimationsNaruto.THROW);
                } else {
                    if (checkOverlap(hero, this.kunai)) {
                        hero.data.values.withWeapon = true;
                        this.kunai.setVisible(false)
                    }
                }
            }
        }
    }

    handlerKeysDown(event) {
        if (event.key === 'Escape') {
            this.scene.start("MenuScene");
        }
        // event first hero
        if (this.hero.state !== enums.PlayerState.DIED) {
            if (this.hero.body.touching.down) {
                if (event.key === enums.ArrowKeys.RIGHT) {
                    this.hero
                        .setVelocityX(75)
                        .setState(enums.PlayerState.WALK)
                        .play(enums.KeysAnimationsNaruto.WALK)
                        .resetFlip()
                }
                if (event.key === enums.ArrowKeys.LEFT) {
                    this.hero
                        .setVelocityX(-75)
                        .setState(enums.PlayerState.WALK)
                        .play(enums.KeysAnimationsNaruto.WALK)
                        .setFlipX(true)
                }
                if (event.key === enums.ArrowKeys.UP) {
                    this.hero
                        .setVelocityY(-300)
                        .setState(enums.PlayerState.JUMP)
                        .play(enums.KeysAnimationsNaruto.JUMP)
                }
                if (event.key === enums.ArrowKeys.DOWN) {
                    this.hero
                        .setState(enums.PlayerState.BLOCK)
                        .setVelocityX(0)
                        .play(enums.KeysAnimationsNaruto.BLOCK)
                }
            } else {
                if (event.key === enums.ArrowKeys.RIGHT) {
                    this.hero.resetFlip()
                }
                if (event.key === enums.ArrowKeys.LEFT) {
                    this.hero.setFlipX(true)
                }
            }
        }

        // event second hero
        if (this.secondHero.state !== enums.PlayerState.DIED) {
            if (this.secondHero.body.touching.down) {
                if (event.key === enums.MoveKeys.D) {
                    this.secondHero
                        .setVelocityX(75)
                        .setState(enums.PlayerState.WALK)
                        .play(enums.KeysAnimationsNaruto.WALK)
                        .resetFlip()
                }
                if (event.key === enums.MoveKeys.A) {
                    this.secondHero
                        .setVelocityX(-75)
                        .setState(enums.PlayerState.WALK)
                        .play(enums.KeysAnimationsNaruto.WALK)
                        .setFlipX(true)
                }
                if (event.key === enums.MoveKeys.W) {
                    this.secondHero
                        .setVelocityY(-300)
                        .setState(enums.PlayerState.JUMP)
                        .play(enums.KeysAnimationsNaruto.JUMP)
                }
                if (event.key === enums.MoveKeys.S) {
                    this.secondHero
                        .setState(enums.PlayerState.BLOCK)
                        .setVelocityX(0)
                        .play(enums.KeysAnimationsNaruto.BLOCK)
                }
            } else {
                if (event.key === enums.MoveKeys.D) {
                    this.secondHero.resetFlip()
                }
                if (event.key === enums.MoveKeys.A) {
                    this.secondHero.setFlipX(true)
                }
            }
        }
    }

    handlerKeysUp(event) {
        if (this.hero.body.touching.down && this.hero.state !== enums.PlayerState.DIED) {
            if (event.key === enums.ArrowKeys.RIGHT) {
                this.hero.setVelocityX(0)
            }
            if (event.key === enums.ArrowKeys.LEFT) {
                this.hero.setVelocityX(0)
            }
            if (event.key === enums.ArrowKeys.DOWN) {
                this.hero
                    .setState(enums.PlayerState.STAND)
                    .play(enums.KeysAnimationsNaruto.STAND)
            }
        }

        if (this.secondHero.body.touching.down && this.secondHero.state !== enums.PlayerState.DIED) {
            if (event.key === enums.MoveKeys.D) {
                this.secondHero.setVelocityX(0)
            }
            if (event.key === enums.MoveKeys.A) {
                this.secondHero.setVelocityX(0)
            }
            if (event.key === enums.MoveKeys.S) {
                this.secondHero
                    .setState(enums.PlayerState.STAND)
                    .play(enums.KeysAnimationsNaruto.STAND)
            }
        }
    }

    handlerAnimationComplete = (currAnim, currFrame, currentHero) => {
        if (currAnim.key === enums.KeysAnimationsNaruto.THROW && currFrame.index === 3) {
            if (!currentHero.flipX) {
                const XnewPositionKunai = currentHero.body.x + currentHero.width + 1,
                    YnewPositionKunai = currentHero.body.y + 15;

                this.kunai
                    .resetFlip()
                    .enableBody(true, XnewPositionKunai, YnewPositionKunai, true, true)
                    .setVelocity(400, -50)
            } else {
                const YnewPositionKunai = currentHero.body.y + 15;

                this.kunai
                    .setFlipX(true)
                    .enableBody(true, currentHero.body.x - 1, YnewPositionKunai, true, true)
                    .setVelocity(-400, -50)
            }
            this.kunai
                .setGravityY(-300)
                .play(enums.KeysAnimationsItems.TAKED)
            currentHero.data.values.withWeapon = false;
            if (currentHero.body.touching.down) {
                currentHero
                    .setVelocityX(0)
                    .setState(enums.PlayerState.STAND)
                    .play(enums.KeysAnimationsNaruto.STAND)
            } else {
                currentHero
                    .setState(enums.PlayerState.FALLEN)
                    .play(enums.KeysAnimationsNaruto.FALLEN)
            }
        }

        if (currAnim.key === enums.KeysAnimationsNaruto.ATTACK && currFrame.index === 3 || currAnim.key === enums.KeysAnimationsNaruto.DAMAGED) {
            if (currentHero.body.touching.down) {
                currentHero
                    .setVelocityX(0)
                    .setState(enums.PlayerState.STAND)
                    .play(enums.KeysAnimationsNaruto.STAND)
            } else {
                currentHero
                    .setState(enums.PlayerState.FALLEN)
                    .play(enums.KeysAnimationsNaruto.FALLEN)
            }
        }
    }

    createPerson(x: number, y: number, keyAttack?: string, keyTake?: string, keyMoveLeft?: string, keyMoveRight?: string, keyJump?: string, keyBlock?: string): Physics.Arcade.Sprite {
        const newPerson: Physics.Arcade.Sprite = this.physics.add.sprite(x, y, enums.KeysLoadResources.STAND);

        newPerson
            .setCollideWorldBounds(true)
            .setDebug(true, true, 0xffff55)
            .getData(['health', 'withWeapon', 'healthBar', 'keyAttack', 'keyTake', 'keyMoveLeft', 'keyMoveRight', 'keyJump', 'keyBlock']);
        newPerson.state = enums.PlayerState.FALLEN;
        newPerson.data.values.health = 100;
        newPerson.data.values.withWeapon = false;
        newPerson.data.values.keyAttack = this.input.keyboard.addKey(keyAttack);
        newPerson.data.values.keyTake = this.input.keyboard.addKey(keyTake);
        newPerson.data.values.keyMoveLeft = this.input.keyboard.addKey(keyMoveLeft);
        newPerson.data.values.keyMoveRight = this.input.keyboard.addKey(keyMoveRight);
        newPerson.data.values.keyJump = this.input.keyboard.addKey(keyJump);
        newPerson.data.values.keyBlock = this.input.keyboard.addKey(keyBlock);
    
        return newPerson;
    }

    heroGetDamage(damagedHero: Physics.Arcade.Sprite, damage: number, directionAttack: string, isStrong?: boolean): void {
        if (damagedHero.data.values.health > 0) {
            let xVelocity = (directionAttack === enums.DirectionAttack.RIGHT) ? 300 : -300
            let xScale = (directionAttack === enums.DirectionAttack.RIGHT) ? 5 : -5

            if (isStrong) {
                damagedHero
                    .setVelocity(xVelocity, -300)
                    .setState(enums.PlayerState.FALLEN)
            } else {
                damagedHero.data.values.healthBar.decrease(damage);
                damagedHero.data.values.health -= damage;

                if (directionAttack === enums.DirectionAttack.RIGHT) {
                    damagedHero.body.x = damagedHero.body.x + xScale;
                }
                if (directionAttack === enums.DirectionAttack.LEFT) {
                    damagedHero.body.x = damagedHero.body.x + xScale;
                }
                damagedHero
                    .setState(enums.PlayerState.DAMAGED)
                    .play(enums.KeysAnimationsNaruto.DAMAGED)
            }
        } else {
            damagedHero
                .setState(enums.PlayerState.DIED)
                .disableBody()
                .play(enums.KeysAnimationsNaruto.DIED)
        }
    }

    kunaiDamagedHero(kunai: Physics.Arcade.Sprite, touchedHero: Physics.Arcade.Sprite): void {
        kunai.flipX
            ? this.heroGetDamage(touchedHero, 5, enums.DirectionAttack.LEFT)
            : this.heroGetDamage(touchedHero, 5, enums.DirectionAttack.RIGHT)
        kunai.play(enums.KeysAnimationsItems.ON_FLOOR);
    }

    fallenKunai(): void {
        this.kunai
            .disableBody()
            .play(enums.KeysAnimationsItems.ON_FLOOR)
    }

    createAnims(): void {
        this.anims.create({
            key: enums.KeysAnimationsItems.ON_FLOOR,
            frames: [ { key: enums.KeysLoadResources.KUNAI, frame: 0 } ],
            frameRate: 1
        });
        this.anims.create({
            key: enums.KeysAnimationsItems.TAKED,
            frames: [ { key: enums.KeysLoadResources.KUNAI, frame: 1 } ],
            frameRate: 1
        });
        this.anims.create({
            key: enums.KeysAnimationsNaruto.STAND,
            frames: this.anims.generateFrameNumbers(enums.KeysLoadResources.STAND, { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: enums.KeysAnimationsNaruto.WALK,
            frames: this.anims.generateFrameNumbers(enums.KeysLoadResources.WALK, { start: 0, end: 5 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: enums.KeysAnimationsNaruto.JUMP,
            frames: this.anims.generateFrameNumbers(enums.KeysLoadResources.JUMP, { start: 0, end: 3 }),
            duration: 1500
        });
        this.anims.create({
            key: enums.KeysAnimationsNaruto.FALLEN,
            frames: [ { key: enums.KeysLoadResources.JUMP, frame: 3 } ],
            frameRate: 1
        });
        this.anims.create({
            key: enums.KeysAnimationsNaruto.BLOCK,
            frames: [ { key: enums.KeysLoadResources.BLOCK, frame: 0 } ],
            frameRate: 1
        });
        this.anims.create({
            key: enums.KeysAnimationsNaruto.THROW,
            frames: this.anims.generateFrameNumbers(enums.KeysLoadResources.THROW, { start: 0, end: 2 }),
            duration: 200
        });
        this.anims.create({
            key: enums.KeysAnimationsNaruto.DIED,
            frames: this.anims.generateFrameNumbers(enums.KeysLoadResources.DIED, { start: 0, end: 1 }),
            duration: 200
        });
        this.anims.create({
            key: enums.KeysAnimationsNaruto.ATTACK,
            frames: this.anims.generateFrameNumbers(enums.KeysLoadResources.ATTACK, { start: 0, end: 2 }),
            duration: 300
        });
        this.anims.create({
            key: enums.KeysAnimationsNaruto.DAMAGED,
            frames: [ { key: enums.KeysLoadResources.DAMAGED, frame: 0 } ],
            duration: 200
        });
    }

    createWorld(): void {
        this.ground = this.physics.add.staticGroup({
            key: enums.KeysLoadResources.GROUND,
            frameQuantity: 8
        });
        Actions.PlaceOnLine(this.ground.getChildren(), new Geom.Line(63, 407, 1070, 407));
    
        this.floor = this.physics.add.staticGroup({
            key: enums.KeysLoadResources.FLOOR,
            frameQuantity: 9
        });
        Actions.PlaceOnLine(this.floor.getChildren(), new Geom.Line(59, 347, 1070, 347));
        this.floor.refresh();
    
        this.wall = this.physics.add.staticGroup({
            key: enums.KeysLoadResources.GROUND,
            frameQuantity: 8
        });
        Actions.PlaceOnLine(this.wall.getChildren(), new Geom.Line(63, 286, 1070, 286));
        this.wall.refresh();
    
        this.wall2 = this.physics.add.staticGroup({
            key: enums.KeysLoadResources.GROUND,
            frameQuantity: 8
        });
        Actions.PlaceOnLine(this.wall2.getChildren(), new Geom.Line(63, 216, 1070, 216));
    
        this.floor2 = this.physics.add.staticGroup({
            key: enums.KeysLoadResources.FLOOR,
            frameQuantity: 9
        });
        Actions.PlaceOnLine(this.floor2.getChildren(), new Geom.Line(59, 320, 1070, 320));
    
        this.background = this.physics.add.staticGroup({
            key: enums.KeysLoadResources.BACKGROUND,
            frameQuantity: 4
        });
        Actions.PlaceOnLine(this.background.getChildren(), new Geom.Line(157, 97, 1400, 97));
    }
}
