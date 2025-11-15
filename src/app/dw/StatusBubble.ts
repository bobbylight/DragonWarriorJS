import { Bubble } from './Bubble';
import { DwGame } from './DwGame';
import { Hero } from './Hero';

export class StatusBubble extends Bubble {

    selection: number;

    constructor(game: DwGame) {

        const scale: number = game.scale;
        const tileSize: number = game.getTileSize();
        const w: number = 172 * scale;
        const x: number = game.getWidth() - tileSize - w;
        const y: number = tileSize * 3;
        const h: number = game.getHeight() - y - tileSize;
        super(game, undefined, x, y, w, h);
        this.selection = 0;
    }

    private calculateX2Offs(val: number | string) {
        if (typeof val === 'number') {
            val = val.toString();
        }
        return this.game.stringWidth(val);
    }

    handleInput() {
    }

    override paintContent(ctx: CanvasRenderingContext2D, x: number, y: number) {

        const SCALE: number = this.game.scale;
        const x2: number = this.x + this.w - Bubble.MARGIN;
        let y0: number = y;
        const Y_INC: number = this.game.stringHeight() + 7 * SCALE;
        const hero: Hero = this.game.hero;

        this.game.drawString('NAME:', x, y0);
        let xOffs: number = this.calculateX2Offs(hero.name);
        this.game.drawString(hero.name, x2 - xOffs, y0);
        y0 += Y_INC;

        this.game.drawString('STRENGTH:', x, y0);
        xOffs = this.calculateX2Offs(hero.strength);
        this.game.drawString(hero.strength, x2 - xOffs, y0);
        y0 += Y_INC;

        this.game.drawString('AGILITY:', x, y0);
        xOffs = this.calculateX2Offs(hero.agility);
        this.game.drawString(hero.agility, x2 - xOffs, y0);
        y0 += Y_INC;

        const attackPower: number = hero.getStrength();
        this.game.drawString('ATTACK POWER:', x, y0);
        xOffs = this.calculateX2Offs(attackPower);
        this.game.drawString(attackPower, x2 - xOffs, y0);
        y0 += Y_INC;

        const defensePower: number = hero.getDefense();
        this.game.drawString('DEFENSE POWER:', x, y0);
        xOffs = this.calculateX2Offs(defensePower);
        this.game.drawString(defensePower, x2 - xOffs, y0);
        y0 += Y_INC;

        const weaponName: string = hero.weapon ? hero.weapon.displayName : '';
        this.game.drawString('WEAPON:', x, y0);
        xOffs = this.calculateX2Offs(weaponName);
        this.game.drawString(weaponName, x2 - xOffs, y0);
        y0 += Y_INC;

        const armorName: string = hero.armor ? hero.armor.displayName : '';
        this.game.drawString('ARMOR:', x, y0);
        xOffs = this.calculateX2Offs(armorName);
        this.game.drawString(armorName, x2 - xOffs, y0);
        y0 += Y_INC;

        const shieldName: string = hero.shield ? hero.shield.displayName : '';
        this.game.drawString('SHIELD:', x, y0);
        xOffs = this.calculateX2Offs(shieldName);
        this.game.drawString(shieldName, x2 - xOffs, y0);
        y0 += Y_INC;

    }
}
