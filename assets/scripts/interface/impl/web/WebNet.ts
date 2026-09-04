import Net from "../../Net";

export default class WebNet implements Net {
    async fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
        return (await window.fetch(url)).arrayBuffer();
    }
}