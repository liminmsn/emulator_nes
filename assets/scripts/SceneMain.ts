import { _decorator, director, instantiate, Layout, Node, Prefab } from "cc";
import CCplatform from "./lib/CCplatform";
import CCGameData from "./lib/CCGameData";
import { Card } from "./prefab/Card";
import CCNetConfig from "./lib/CCNetConfig";

const { ccclass, property } = _decorator;
@ccclass("SceneMain")
export class SceneMain extends CCplatform {
    @property(Node)
    loding: Node;
    @property(Node)
    err: Node;

    @property(Node)
    content: Node;
    @property(Node)
    content_card: Node;
    @property(Prefab)
    content_card_item: Prefab;

    protected start(): void {
        this.showPage(0);
    }

    async showPage(index: number) {
        //页面切换
        [this.loding, this.content, this.err].filter((item, idx) => {
            if (index == idx) {
                item.active = true;
            } else {
                item.active = false;
            }
        });
        //页面逻辑
        switch (index) {
            case 0:
                if (CCGameData.isGameListNull()) {
                    try {
                        const list = await this.net.getGameList();
                        CCGameData.setGameList(list);
                        this.showPage(1);
                    } catch (error) {
                        this.showPage(2);
                    }
                    return;
                }
                this.showPage(1);
                break;
            case 1:
                const list = CCGameData.getGameList();
                list.filter(item => {
                    const card_item = instantiate(this.content_card_item);
                    const card = card_item.getComponent(Card);
                    card.setValue(item, () => {
                        CCGameData.ROM_URL = CCNetConfig.baseUrl + item.file;
                        director.loadScene('nes');
                    });
                    this.content_card.addChild(card_item);
                });
                this.content_card.getComponent(Layout).updateLayout();
                break;
        }
    }

    onBtnClick(key: string, this_: this): void {
        if (key == "Err") {
            this.showPage(0);
        }
    }
}