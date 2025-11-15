import MapLogic, { NpcText } from './MapLogic';
import DwGame from '../DwGame';
import Npc from '../Npc';

export type NpcTextGenerator = (map: DwGame) => NpcText;

export type NpcTextGeneratorMap = Record<string, NpcTextGenerator>;

/**
 * A base class for map logics.
 */
export default class AbstractMapLogic implements MapLogic {

    private readonly conversationMap: NpcTextGeneratorMap;

    protected constructor(conversationMap: NpcTextGeneratorMap) {
        this.conversationMap = conversationMap;
    }

    init() {
    }

    npcText(npc: Npc, game: DwGame): NpcText {
        console.log('Talking to: ' + JSON.stringify(npc.name));
        const data: NpcTextGenerator = this.conversationMap[npc.name];
        return data?.call(this, game) ?? 'I have nothing to say...';
    }

}
