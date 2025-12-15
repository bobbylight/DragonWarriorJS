import { SpriteSheet, TiledLayer, TiledObject, Utils } from 'gtp';
import { RoamingEntity,RoamingEntityArgs } from './RoamingEntity';
import { Hero } from './Hero';
import { Direction } from './Direction';
import { Shield } from './Shield';
import { Weapon } from './Weapon';
import { Armor } from './Armor';
import { Enemy } from './Enemy';
import { DwGame } from './DwGame';

export interface PartyMemberArgs extends RoamingEntityArgs {
    hp?: number;
    maxHp?: number;
    mp?: number;
    maxMp?: number;
}

export class PartyMember extends RoamingEntity {

    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    level: number;
    exp: number;
    strength: number;
    agility: number;
    weapon?: Weapon;
    armor?: Armor;
    shield?: Shield;
    readonly spells: string[]; // TODO

    constructor(game: DwGame, args: PartyMemberArgs) {

        super(game, args);
        this.level = 1;
        this.exp = 12345;

        this.strength = 4;
        //this.defense = 10;
        this.agility = 4;

        this.hp = args.hp ?? args.maxHp ?? 1234;
        this.maxHp = this.hp;
        this.mp = args.mp ?? args.maxMp ?? 0;
        this.maxMp = this.mp;

        this.spells = [];

        //BattleEntity.call(this, args); // TODO: Better way to do a mixin?
        //Utils.mixin(RoamingEntityMixin.prototype, this);
        //BattleEntityMixin.call(this);

    }

    computePhysicalAttackDamage(enemy: Enemy) {

        const strength: number = this.getStrength();
        let min: number;
        let max: number;

        if (/*!enemy.cannotBeExcellentMoved &&*/ PartyMember.getPerformExcellentMove()) {
            min = Math.floor(strength / 2);
            max = this.strength;
        } else {
            const temp: number = strength - enemy.agility / 2;
            min = Math.floor(temp / 4);
            max = Math.floor(temp / 2);
        }

        let damage: number = Utils.randomInt(min, max + 1);
        if (damage < 1) {
            damage = Utils.randomInt(0, 2) === 0 ? 1 : 0;
        }
        return damage;
    }

    getDefense() {
        let defense: number = Math.floor(this.agility / 2);
        if (this.armor) {
            defense += this.armor.defense;
        }
        if (this.shield) {
            defense += this.shield.defense;
        }
        return defense;
    }

    private static getPerformExcellentMove(): boolean {
        return Utils.randomInt(0, 32) === 0;
    }

    getStrength(): number {
        return this.strength + (this.weapon ? this.weapon.power : 0);
    }

    /**
     * Called when this entity intersects an object on the map.  The default
     * implementation does nothing; subclasses can override.
     */
    handleIntersectedObject(obj: TiledObject) {
        // Do nothing
    }

    update(delta: number) {

        this.stepTick += delta;
        if (this.stepTick >= 600) {
            this.stepTick -= 600;
            Hero.stepInc = 0;
        } else if (this.stepTick >= 300) {
            Hero.stepInc = 1;
        }

        this.handleIsMovingInUpdate();

    }

    render(ctx: CanvasRenderingContext2D) {

        const tileSize: number = this.game.getTileSize();

        const ssRow = 0;
        let ssCol = 0;
        switch (this.direction) {
            case Direction.NORTH:
                ssCol = 4;
                break;
            case Direction.SOUTH:
                //ssCol = 0;
                break;
            case Direction.EAST:
                ssCol = 6;
                break;
            case Direction.WEST:
                ssCol = 2;
                break;
        }
        ssCol += Hero.stepInc;

        const x: number = (this.game.canvas.width - tileSize) / 2;
        const y: number = (this.game.canvas.height - tileSize) / 2;
        const spriteSheet: SpriteSheet = this.game.assets.get('hero');
        spriteSheet.drawSprite(ctx, x, y, ssRow, ssCol);

    }

    override handlePostMove() {
        // If we didn't e.g. move to another map, see if we should fight a monster
        if (!this.possiblyHandleIntersectedObject()) {
            this.possiblyStartRandomEncounter();
        }
    }

    /**
     * Adds HP to this entity's total, making sure to not exceed its maximum
     * HP value.  The inverse of this method is <code>takeDamage</code>.
     *
     * @param amount The amount of HP to add.
     * @return Whether this entity is dead (has 0 HP).  This will
     *         only be possible if you pass a negative value to this method.
     * @see takeDamage
     */
    incHp(amount: number) {
        this.hp = Math.min(this.hp + amount, this.maxHp);
        this.hp = Math.max(0, this.hp);
        return this.isDead();
    }

    isDead(): boolean {
        return this.hp <= 0;
    }

    /**
     * Verifies whether the party member is intersecting an object in the Tiled
     * map, and if so, handles that intersection.
     *
     * @return Whether an object was intersected.
     */
    possiblyHandleIntersectedObject(): boolean {

        // See if we're supposed to warp to another map
        const warpLayer: TiledLayer = this.game.getMap().getLayer('warpLayer');
        const tileSize: number = this.game.getTileSize();
        const x: number = this.mapCol * tileSize;
        const y: number = this.mapRow * tileSize;

        const obj: TiledObject | undefined = warpLayer.getObjectIntersecting(x, y, tileSize, tileSize);
        if (obj) {
            this.handleIntersectedObject(obj);
            return true;
        }

        return false;
    }

    private possiblyStartRandomEncounter() {
        if (this.game.randomInt(20) === 0) {
            this.game.startRandomEncounter();
        }
    }

    /**
     * Replenishes the HP and MP of this party member.
     */
    replenishHealthAndMagic() {
        this.hp = this.maxHp;
        this.mp = this.maxMp;
    }

    /**
     * Subtracts HP from this entity's current amount.  This is the inverse
     * of <code>incHp</code>.
     *
     * @param amount The amount of hit points to deduct.
     * @return Whether this entity is dead (has 0 HP).
     * @see incHp
     */
    takeDamage(amount: number) {
        this.incHp(-amount);
    }
}
