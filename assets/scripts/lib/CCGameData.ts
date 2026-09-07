export default class {
    public static ROM_URL: string;
    protected static gameList: GameListType[] = [];
    static setGameList(gameList: GameListType[]) {
        this.gameList = gameList;
    }
    static getGameList() {
        return this.gameList;
    }
    static isGameListNull() {
        return this.gameList.length == 0;
    }
}