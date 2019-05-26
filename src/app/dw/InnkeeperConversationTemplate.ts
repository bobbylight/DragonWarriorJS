import DwGame from './DwGame';
import Conversation from './Conversation';

export default (conversation: Conversation, segmentArgs: any) => {

   const game: DwGame = (window as any).game;

   return [
      {
         clear: false,
         text: 'Welcome to the inn.  Our price is ' + segmentArgs.cost + ' gold per night.  Wilst thou stay?',
         afterSound: 'confirmation',
         choices: [
            { text: 'Yes', next: 'stay' },
            { text: 'No',  next: 'leave' }
         ]
      },
      {
         id: 'stay',
         text: 'Have a good night!',
         overnight: true
      },
      {
         text: 'I hope you had a good night.',
         action: () => {
            game.party.replenishHealthAndMagic();
            game.party.gold -= segmentArgs.cost;
         }
      },
      { text: 'I shall see thee again.', next: '_done' },
      {
         id: 'leave',
         text: 'I shall see thee again.'
      }
   ];
};
