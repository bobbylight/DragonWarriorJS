/**
 * Logic for Tantegel Castle.
 */
import DwGame from '../DwGame';

const talks: any = {

  south_soldier_left: (game: DwGame) => {
     return 'Welcome to Tantegel Castle.';
  },

  south_soldier_right: (game: DwGame) => {
     return 'Welcome to Tantegel Castle.';
  },

  bottom_left_merchant_1: (game: DwGame) => {
     return 'We are merchants who have traveled much in this land.\n' +
           'Many of our colleagues have been killed by servants of the Dragonlord.';
  },

  bottom_left_merchant_2: (game: DwGame) => {
     return "Rumor has it that entire towns have been destroyed by the Dragonlord's servants.";
  },

  bottom_right_soldier: (game: DwGame) => {
     return 'Where oh where can I find Princess Gwaelin?';
  },

  bottom_right_soldier_2: (game: DwGame) => {
     return 'When entering the cave, take with thee a torch.';
  },

  bottom_right_old_man: (game: DwGame) => {
     return "\\w{hero.name}'s coming was foretold by legend. May the light shine upon this brave warrior.";
  },

  stairs_soldier_north: (game: DwGame) => {
     return 'King Lorik will record thy deeds in his Imperial Scroll so thou may return to thy quest later.';
  },

  stairs_soldier_south: (game: DwGame) => {
     return 'If thou art planning to take a rest, first see King Lorik.';
  },

  woman_near_stairs: (game: DwGame) => {
     return 'Where oh where can I find Princess Gwaelin?';
  },

  man_near_stairs: (game: DwGame) => {
     return 'There was a time when Brecconary was a paradise.\n' +
           "Then the Dragonlord's minions came.";
  },

  treasure_room_soldier: (game: DwGame) => {
     return 'How did you get in here???'; // TODO
  },

  man_in_west_room: (game: DwGame) => {
     return 'To become strong enough to face future trials thou must first battle many foes.';
  },

  top_right_soldier: (game: DwGame) => {
     return 'Thou must have a key to open a door.';
  },

  outside_merchant: (game: DwGame) => {
     return 'I have nothing to sell right now!'; // TODO
  },

  outside_woman: (game: DwGame) => {
     return 'What are you doing out here?'; // TODO
  },

  prison_guard_soldier: (game: DwGame) => {
     return 'This is the prison.'; // TODO
  },

  old_man_east: (game: DwGame) => {
     return "Leave me alone, I'm old!"; // TODO
  },

  prisoner_red_soldier: (game: DwGame) => {
     return 'I was arrested for being a peeping tom.'; // TODO
  },

  // King's court NPCs

  king_soldier_right: (game: DwGame) => {
     return 'Listen to what people say.\nIt can be of great help.';
  },

  king_soldier_left: (game: DwGame) => {
     return [ 'A word of advice.',
           'Save thy money for more expensive armor.' ];
  },

  king_soldier_wandering: (game: DwGame) => {
     return [
        {
           text: 'Dost thou know about Princess Gwaelin?',
           afterSound: 'confirmation',
           choices: [
              { text: 'Yes', next: 'knows' },
              { text: 'No', next: 'doesntKnow' }
           ]
        },
        {
           id: 'doesntKnow',
           text: 'Half a year hath passed since the Princess was kidnapped by the enemy.'
        },
        'Never does the King speak of it, but he must be suffering much.',
        {
           id: 'knows',
           text: '\\w{hero.name}, please save the Princess.',
           next: '_done'
        },
     ];
  },

  king: (game: DwGame) => {
     return 'You cannot save yet.  Sorry!';
  }

};

import AbstractMapLogic from './AbstractMapLogic';

export default class TantegelCastle extends AbstractMapLogic {

    constructor() {
        super(talks);
    }
}
