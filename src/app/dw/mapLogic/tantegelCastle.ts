import DwGame from '../DwGame';
import AbstractMapLogic, { NpcTextGeneratorMap } from './AbstractMapLogic';
import { NpcText } from './MapLogic';
import Conversation from '../Conversation';

const talks: NpcTextGeneratorMap = {

  south_soldier_left: (game: DwGame) => {
     return 'Welcome to Tantegel Castle.';
  },

  south_soldier_right: (game: DwGame): NpcText => {
     return 'Welcome to Tantegel Castle.';
  },

  bottom_left_merchant_1: (game: DwGame): NpcText => {
     return 'We are merchants who have traveled much in this land.\n' +
           'Many of our colleagues have been killed by servants of the Dragonlord.';
  },

  bottom_left_merchant_2: (game: DwGame): NpcText => {
     return "Rumor has it that entire towns have been destroyed by the Dragonlord's servants.";
  },

  bottom_right_soldier: (game: DwGame): NpcText => {
     return 'Where oh where can I find Princess Gwaelin?';
  },

  bottom_right_soldier_2: (game: DwGame): NpcText => {
     return 'When entering the cave, take with thee a torch.';
  },

  bottom_right_old_man: (game: DwGame): NpcText => {
     return "\\w{hero.name}'s coming was foretold by legend. May the light shine upon this brave warrior.";
  },

  stairs_soldier_north: (game: DwGame): NpcText => {
     return 'King Lorik will record thy deeds in his Imperial Scroll so thou may return to thy quest later.';
  },

  stairs_soldier_south: (game: DwGame): NpcText => {
     return 'If thou art planning to take a rest, first see King Lorik.';
  },

  woman_near_stairs: (game: DwGame): NpcText => {
     return 'Where oh where can I find Princess Gwaelin?';
  },

  man_near_stairs: (game: DwGame): NpcText => {
     return 'There was a time when Brecconary was a paradise.\n' +
           "Then the Dragonlord's minions came.";
  },

  treasure_room_soldier: (game: DwGame): NpcText => {
     return 'How did you get in here???'; // TODO
  },

  man_in_west_room: (game: DwGame): NpcText => {
     return 'To become strong enough to face future trials thou must first battle many foes.';
  },

  top_right_soldier: (game: DwGame): NpcText => {
     return 'Thou must have a key to open a door.';
  },

  outside_merchant: (game: DwGame): NpcText => {
     return 'I have nothing to sell right now!'; // TODO
  },

  outside_woman: (game: DwGame): NpcText => {
     return 'What are you doing out here?'; // TODO
  },

  prison_guard_soldier: (game: DwGame): NpcText => {
     return 'This is the prison.'; // TODO
  },

  old_man_east: (game: DwGame): NpcText => {
     return "Leave me alone, I'm old!"; // TODO
  },

  prisoner_red_soldier: (game: DwGame): NpcText => {
     return 'I was arrested for being a peeping tom.'; // TODO
  },

  // King's court NPCs

  king_soldier_right: (game: DwGame): NpcText => {
     return 'Listen to what people say.\nIt can be of great help.';
  },

  king_soldier_left: (game: DwGame): NpcText => {
     return [ 'A word of advice.',
           'Save thy money for more expensive armor.' ];
  },

  king_soldier_wandering: (game: DwGame): NpcText => {
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

  king: (game: DwGame): NpcText => {
     return [
         {
             text: 'I am greatly pleased that thou has returned, \\w{hero.name}.'
         },
         {
             text: 'Before reaching thy next level of experience thou must gain \\w{hero.expRemaining} Points.'
         },
         {
             text: "Will thou tell me now of thy deeds so they won't be forgotten?",
             choices: [
                 { text: 'Yes', next: 'tell' },
                 { text: 'No', next: 'dontTell' }
             ]
         },
         {
             id: 'tell',
             text: 'Thy deeds have been recorded on the Imperial Scrolls of Honor.'
         },
         {
             id: 'dontTell',
             text: 'Dost thou wish to continue thy quest?',
             choices: [
                 { text: 'Yes', next: 'continue' },
                 { text: 'No', next: 'dontContinue' }
             ]
         },
         {
             id: 'dontContinue',
             text: 'Rest then for awhile.',
             next: Conversation.DONE // TODO: Reset to title screen
         },
         {
             id: 'continue',
             text: 'Goodbye now, \\w{hero.name}. Take care and tempt not the Fates.',
             next: Conversation.DONE
         },
     ];
  }

};

/**
 * Logic for Tantegel Castle.
 */
export default class TantegelCastle extends AbstractMapLogic {

    constructor() {
        super(talks);
    }
}
