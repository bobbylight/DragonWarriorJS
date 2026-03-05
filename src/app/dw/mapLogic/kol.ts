import { AbstractMapLogic, NpcTextGeneratorMap } from './AbstractMapLogic';
import { DwGame } from '@/app/dw/DwGame';
import { NpcText } from '@/app/dw/mapLogic/MapLogic';
import { Conversation } from '@/app/dw/Conversation';

const talks: NpcTextGeneratorMap = {

    blue_man_descendant_of_erdrick: (game: DwGame): NpcText => {
        return 'Art thou the descendant of Erdrick?\nHast thou any proof?';
    },

    blue_man_middle: (game: DwGame): NpcText => {
        return [
            'Dreadful is the South Island.',
            'Great strength and skill and wit only will bring thee back from that place.',
        ];
    },

    blue_woman_middle: (game: DwGame): NpcText => {
        return 'Please, save us from the minions of the Dragonlord.';
    },

    blue_woman_near_fountain: (game: DwGame): NpcText => {
        return 'This bath cures rheumatism.';
    },

    gray_soldier_middle: (game: DwGame): NpcText => {
        return 'Golem is afraid of the music of the flute, so \'tis said.';
    },

    innkeeper: (game: DwGame): NpcText => {
        return {
            conversationType: 'innkeeper',
            cost: 20,
        };
    },

    old_man_entrance: (game: DwGame): NpcText => {
        return 'This is the village of Kol.';
    },

    old_man_locked_away: (game: DwGame): NpcText => {
        return [
            {
                id: 'makeUserChoose',
                clear: false,
                text: 'Hast thou found the flute?',
                choices: [
                    { text: 'YES', next: 'yesResponse' },
                    { text: 'NO', next: 'noResponse' },
                ],
            },
            {
                id: 'yesResponse', text: 'Go to the town of Cantlin.', next: Conversation.DONE,
            },
            {
                id: 'noResponse', text: 'Howard had it, but he went to Rimuldar and never returned.',
                next: Conversation.DONE,
            },
        ];
    },

    old_man_northeast: (game: DwGame): NpcText => {
        return 'In legends it is said that fairies know how to put Golem to sleep.';
    },

    old_man_northwest: (game: DwGame): NpcText => {
        // TODO: Fix this condition!
        const readyForDragonlord = game.hero.weapon?.name === 'erdricksSword';

        if (readyForDragonlord) {
            return 'TODO: Find and enter the proper text for me to say!';
        }

        return [
            'Thou thou art as brave as thy ancestor, \\w{hero.name}, thou cannot defeat the great Dragonlord with such weapons.',
            'Thou shouldst come here again.',
        ];
    },

    red_soldier_nester: (game: DwGame): NpcText => {
        return 'Hast thou seen Nester?\nI think he may need help.';
    },

    red_soldier_shop: (game: DwGame): NpcText => {
        return "East of Hauksness there is a town, 'tis said, where one may purchase weapons of extraordinary quality.";
    },

    southwest_soldier: (game: DwGame): NpcText => {
        return 'Rimuldar is the place to buy keys.';
    },

    tools_merchant: (game: DwGame): NpcText => {
        // TODO: Get this item list and implement a tools dealer template
        return {
            conversationType: 'merchant',
            choices: [ 'bambooPole' ],
            introText: 'Welcome.\nWe deal in tools.\nWhat can I do for thee?',
        };
    },

    wandering_sw_merchant: (game: DwGame): NpcText => {
        return [
            {
                id: 'makeUserChoose',
                clear: false,
                text: 'Hast thou been to the southern island?',
                choices: [
                    { text: 'YES', next: 'yesResponse' },
                    { text: 'NO', next: 'noResponse' },
                ],
            },
            {
                id: 'yesResponse', text: 'I have heard that powerful enemies live there.', next: Conversation.DONE,
            },
            {
                id: 'noResponse', text: 'To the south, I believe, there is a town called Rimuldar.',
                next: Conversation.DONE,
            },
        ];
    },

    weapons_merchant: (game: DwGame): NpcText => {
        return {
            conversationType: 'merchant',
            choices: [ 'copperSword', 'handAxe', 'halfPlate', 'fullPlate', 'smallShield' ],
            introText: 'We deal in weapons and armor.\nDost thou wish to buy anything today?',
        };
    },
};

/**
 * Logic for Kol.
 */
export class Kol extends AbstractMapLogic {

    constructor() {
        super(talks);
    }
}
