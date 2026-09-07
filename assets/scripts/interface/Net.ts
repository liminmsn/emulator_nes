export default interface Net {
    fetchArrayBuffer(url: string): Promise<ArrayBuffer>;
    getGameList(): Promise<GameListType[]>;
}