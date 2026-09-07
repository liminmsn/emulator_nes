import { _decorator, assetManager, Component, director, ImageAsset, Label, Node, NodeEventType, Sprite, SpriteFrame } from "cc"
import CCNetConfig from "../lib/CCNetConfig";
const { ccclass, property } = _decorator;

@ccclass("Card")
export class Card extends Component {
    @property(Sprite)
    img_sprite: Sprite;
    @property(Label)
    label: Label;

    setValue(item: GameListType, on_click: () => void) {
        const imgUrl = CCNetConfig.baseUrl + item.img;
        //标题
        this.label.string = item.name;
        // 加载远程图片
        assetManager.loadRemote<ImageAsset>(imgUrl, { ext: '.png' }, (err, imageAsset) => {
            if (err) {
                console.error("图片加载失败：", err);
                return;
            }
            this.img_sprite.spriteFrame = SpriteFrame.createWithImage(imageAsset);
        });
        this.node.on(NodeEventType.TOUCH_END, on_click);
    }
}