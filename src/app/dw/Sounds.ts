type Sounds =
    'MUSIC_TITLE_SCREEN' |
    'MUSIC_TANTEGEL' |
    'MUSIC_TANTEGEL_LOWER' |
    'MUSIC_OVERWORLD' |
    'MUSIC_BATTLE' |
    'MUSIC_TOWN' |
    'MUSIC_DUNGEON_FLOOR_1'
;

const SoundMap = new Map<Sounds, string>([
    [ 'MUSIC_TITLE_SCREEN', 'titleMusic' ],
    [ 'MUSIC_TANTEGEL', 'tantegelMusic' ],
    [ 'MUSIC_TANTEGEL_LOWER', 'tantegelLowerMusic' ],
    [ 'MUSIC_OVERWORLD', 'overworldMusic' ],
    [ 'MUSIC_BATTLE', 'battleMusic' ],
    [ 'MUSIC_TOWN', 'villageMusic' ],
    [ 'MUSIC_DUNGEON_FLOOR_1', 'dungeonFloor1' ]
]);

export const getSound = (sound: Sounds): string | undefined => {
    return SoundMap.get(sound);
}
export default Sounds;

