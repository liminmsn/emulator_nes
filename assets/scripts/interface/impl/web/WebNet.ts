import CCNetConfig from "../../../lib/CCNetConfig";
import Net from "../../Net";

export default class WebNet implements Net {
    async getGameList(): Promise<GameListType[]> {
        return await (await window.fetch(CCNetConfig.game_list)).json();
    }
    async fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
        return (await window.fetch(url)).arrayBuffer();
    }
}