import { Utils } from 'gtp';
import { Hero } from '@/app/dw/Hero';
import { Enemy } from '@/app/dw/Enemy';
import { ConversationSegmentArgs } from '@/app/dw/ConversationSegment';

export type SpellTarget = Hero | Enemy;

export interface SpellResult {
    conversationSegments?: ConversationSegmentArgs[] | undefined;
}

export interface Spell {
    name: string;
    cost: number;
    cast(caster: SpellTarget, target?: SpellTarget): SpellResult;
}

const healSpell: Spell = {
    name: 'HEAL',
    cost: 4,
    cast(caster: SpellTarget, target?: SpellTarget): SpellResult {
        const healAmount = Utils.randomInt(10, 18);
        caster.hp = Math.min(caster.hp + healAmount, caster.maxHp);
        return {};
    },
};

const hurtSpell: Spell = {
    name: 'HURT',
    cost: 2,
    cast(caster: SpellTarget, target?: SpellTarget): SpellResult {
        // Player casts Hurt outside of battle
        if (!target) {
            return {
                conversationSegments: [
                    {
                        text: 'But nothing happened.',
                    },
                ],
            };
        }

        let damage = 0;
        let targetDescription = 'Thy';
        if (target instanceof Hero) {
            let min: number;
            let max: number;

            if (target.armor?.name === 'magicArmor' || target.armor?.name === 'erdricksArmor') {
                min = 2;
                max = 6;
            } else {
                min = 3;
                max = 10;
            }
            damage = Utils.randomInt(min, max + 1);
        } else {
            damage = Utils.randomInt(5, 13);
            targetDescription = `The ${target.name}'s`;
        }
        target.takeDamage(damage);

        return {
            conversationSegments: [
                {
                    text: `${targetDescription} Hit Points have been reduced by ${damage}.`,
                },
            ],
        };
    },
};

export { healSpell, hurtSpell };
