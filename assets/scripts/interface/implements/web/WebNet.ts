import Net from "../../interface/Net";

export class WebNet implements Net {
    async fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
        return (await window.fetch(url)).arrayBuffer();
    }
}