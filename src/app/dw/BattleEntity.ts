export default class BattleEntity {

   hp: number;
   maxHp: number;
   mp: number;
   maxMp: number;

   constructor(args: any = {}) {
      this.hp = args.hp || 0;
      this.maxHp = args.hp || 0;
      this.mp = args.mp || 0;
      this.maxMp = args.mp || 0;
   }

   isDead(): boolean {
      return this.hp <= 0;
   }

   takeDamage(amount: number) {
      this.hp = Math.max(0, this.hp - amount);
      return this.isDead();
   }
}
