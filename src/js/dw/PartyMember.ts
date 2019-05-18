import RoamingEntity from './RoamingEntity';
import { SpriteSheet, TiledObject, Utils } from 'gtp';
import Hero from './Hero';
import Direction from './Direction';
import Shield from './Shield';
import Weapon from './Weapon';
import Armor from './Armor';

export default class PartyMember extends RoamingEntity {

    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    name: string;
    level: number;
    exp: number;
    _strength: number;
    spriteSheet: SpriteSheet;
    agility: number;
    weapon?: Weapon;
    armor?: Armor;
    shield?: Shield;
    
    constructor(args: any) {

        super(args);

        this.name = args.name;
        this.level = 1;
        this.exp = 12345;

        this._strength = 4;
        //this.defense = 10;
        this.agility = 4;

        this.hp = args.hp || 1234;
        this.maxHp = args.hp || 0;
        this.mp = args.mp || 0;
        this.maxMp = args.mp || 0;

        //dw.BattleEntity.call(this, args); // TODO: Better way to do a mixin?
        //Utils.mixin(dw.RoamingEntityMixin.prototype, this);
        //dw.BattleEntityMixin.call(this);

    }

    computePhysicalAttackDamage(enemy: any) {

        var strength = this.getStrength(),
            min, max;
        if (!enemy.cannotBeExcellentMoved && this._getPerformExcellentMove()) {
            min = Math.floor(strength / 2);
            max = this._strength;
        } else {
            var temp = strength - enemy.agility / 2;
            min = Math.floor(temp / 4);
            max = Math.floor(temp / 2);
        }

        var damage = Utils.randomInt(min, max + 1);
        if (damage < 1) {
            damage = Utils.randomInt(0, 2) === 0 ? 1 : 0;
        }
        return damage;
    }

    getDefense() {
        var defense = Math.floor(this.agility / 2);
        if (this.armor) {
            defense += this.armor.defense;
        }
        if (this.shield) {
            defense += this.shield.defense;
        }
        return defense;
    }

    private _getPerformExcellentMove(): boolean {
        return Utils.randomInt(0, 32) === 0;
    }

    getStrength(): number {
        return this._strength + (this.weapon ? this.weapon.power : 0);
    }

    /**
     * Called when this entity intersects an object on the map.  The default
     * implementation does nothing; subclasses can override.
     */
    handleIntersectedObject(obj: TiledObject) {
        'use strict';
        // Do nothing
    }

    update(delta: number) {

        this._stepTick += delta;
        if (this._stepTick >= 600) {
            this._stepTick -= 600;
            Hero.STEP_INC = 0;
        } else if (this._stepTick >= 300) {
            Hero.STEP_INC = 1;
        }

        this.handleIsMovingInUpdate();

    }

    render(ctx: CanvasRenderingContext2D) {

        var tileSize = this.game.getTileSize();

        // TODO: Move SpriteSheets to AssetManager or somewhere else
        if (!this.spriteSheet) {
            this.spriteSheet = this.game.assets.get('hero');
        }

        var ssRow = 0, ssCol = 0;
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
        ssCol += dw.Hero.STEP_INC;

        var x = (this.game.canvas.width - tileSize) / 2;
        var y = (this.game.canvas.height - tileSize) / 2;
        this.spriteSheet.drawSprite(ctx, x, y, ssRow, ssCol);
        //   ctx.drawImage(img, imgX,imgY,tileSize,tileSize, x,y,tileSize,tileSize);

    }

    handlePostMove() {

        // See if we're supposed to warp to another map
        var warpLayer = this.game.map.getLayer('warpLayer');
        var tileSize = this.game.getTileSize();
        var x = this.mapCol * tileSize;
        var y = this.mapRow * tileSize;

        var obj = warpLayer.getObjectIntersecting(x, y, tileSize, tileSize);
        if (obj) {
            this.handleIntersectedObject(obj);
        }

        // See if we should fight a monster
        else {
            this._possiblyStartRandomEncounter();
        }
    }

    /**
     * Adds HP to this entity's total, making sure to not exceed its maximum
     * HP value.  The inverse of this method is <code>takeDamage</code>.
     *
     * @param {int} amount The amount of HP to add.
     * @return {boolean} Whether this entity is dead (has 0 HP).  This will
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

    _possiblyStartRandomEncounter() {
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
     * @param {int} amount The amount of hit points to deduct.
     * @return {boolean} Whether this entity is dead (has 0 HP).
     * @see incHp
     */
    takeDamage(amount: number) {
        this.incHp(-amount);
    }
}
