import BattleEntity from './BattleEntity';
import { Image, Utils } from 'gtp';
import RoamingEntity from './RoamingEntity';
import EnemyAI, { EnemyAiFunc } from './EnemyAI';
import Hero from './Hero';
import DwGame from './DwGame';

export default class Enemy extends BattleEntity {

    game: DwGame;
    name: string;
    image: string;
    damagedImage: string;
    str: number;
    agility: number;
    dodge: number;
    xp: number;
    gp: number;
    ai: EnemyAiFunc;

    constructor(args: any) {

        super(args);

        Utils.mixin(args, this);
        Utils.mixin(RoamingEntity.prototype, this);

        this.game = (window as any).game;
        this.ai = EnemyAI.get(args.ai);

        // Convert arrays into a single value.
        // These values can be an array of form [min, max], both inclusive
        if (args.hp.length) {
            this.hp = Utils.randomInt(args.hp[0], args.hp[1] + 1);
        }
        if (args.gp.length) {
            this.gp = Utils.randomInt(args.gp[0], args.gp[1] + 1);
        }
    }

    computeHurtSpellDamage(hero: Hero): number {

        let min: number;
        let max: number;

        if (hero.armor?.name === 'magicArmor' || hero.armor?.name === 'erdricksArmor') {
            min = 2;
            max = 6;
        }
        else {
            min = 3;
            max = 10;
        }

        return Utils.randomInt(min, max + 1);
    }

    computePhysicalAttackDamage(hero: Hero): number {

        if (hero.getDefense() >= this.str) {
            return Utils.randomInt(0, Math.floor((this.str + 4) / 6) + 1);
        }

        const temp: number = this.str - Math.floor(hero.getDefense() / 2);
        const min: number = Math.floor(temp / 4);
        const max: number = Math.floor(temp / 2);
        return Utils.randomInt(min, max + 1);
    }

    getImage(hit: boolean): Image {
        return this.game.assets.get(hit ? this.damagedImage : this.image);
    }

    prepare() {
        return this;
    }
}
