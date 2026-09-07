import { sys } from "cc";
import CCcomponent from "./CCcomponent";
import WebNet from "../interface/impl/web/WebNet";
import WechatNet from "../interface/impl/wechat/WechatNet";
import Net from "../interface/Net";
import Audio from "../interface/Audio";
import WebAudio from "../interface/impl/web/WebAudio";
import GameData from "./CCGameData";

export default abstract class CcPlatform extends CCcomponent {
    protected game_data: GameData = GameData;
    protected audio: Audio | null = null;
    protected net: Net;
    protected onLoad(): void {
        super.onLoad();
        switch (sys.platform) {
            case sys.Platform.WECHAT_GAME:
                this.net = new WechatNet();
                this.audio = new WebAudio();
                break;
            default:
                this.net = new WebNet();
                this.audio = new WebAudio();
                break;
        }
    }
}