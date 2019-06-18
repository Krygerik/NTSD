import {GameObjects, Geom} from "phaser";

export default function checkOverlap(spriteA: GameObjects.Sprite, spriteB: GameObjects.Sprite): boolean {
    return Geom.Intersects.RectangleToRectangle(spriteA.getBounds(), spriteB.getBounds());
}