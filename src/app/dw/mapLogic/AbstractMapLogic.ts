import MapLogic from './MapLogic';
import DwGame from '../DwGame';
import Npc from '../Npc';

/**
 * A base class for map logics.
 */
export default class AbstractMapLogic implements MapLogic {

    protected readonly game: DwGame;
    private readonly conversationMap: any;

    protected constructor(conversationMap: any) {
        this.conversationMap = conversationMap;
        this.game = (window as any).game as DwGame;
    }

    init() {
    }

    npcText(npc: Npc): string {
        console.log('Talking to: ' + JSON.stringify(npc.name));
        const data: any = this.conversationMap[npc.name];
        return data ? data.call(this, this.game) : 'I have nothing to say...';
    }

}
