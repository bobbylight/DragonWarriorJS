import {EnemyData} from "./Enemy";
import {Utils} from "gtp";

export default class BattleEntity {

   hp: number;
   maxHp: number;
   mp: number;
   maxMp: number;

   constructor(args: EnemyData) {
       if (typeof args.hp === 'number') {
           this.hp = args.hp;
       }
       else {
           this.hp = Utils.randomInt(args.hp[0], args.hp[1] + 1);
       }
       this.maxHp = this.hp;
       this.mp = this.maxMp = 0; // args.mp;
   }

   isDead(): boolean {
      return this.hp <= 0;
   }

   takeDamage(amount: number) {
      this.hp = Math.max(0, this.hp - amount);
      return this.isDead();
   }
}
