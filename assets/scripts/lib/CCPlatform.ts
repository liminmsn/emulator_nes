import CCComponent from "./CCComponent";
import WebNet from "../interface/impl/web/WebNet";
import WechatNet from "../interface/impl/wechat/WechatNet";
import Net from "../interface/Net";
import { sys } from "cc";

export default abstract class CCPlatform extends CCComponent {
    net: Net;
    protected onLoad(): void {
        super.onLoad();
        switch (sys.platform) {
            case sys.Platform.WECHAT_GAME:
                this.net = new WechatNet();
                break;
            default:
                this.net = new WebNet();
                break;
        }
    }
}