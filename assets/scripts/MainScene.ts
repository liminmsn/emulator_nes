import { _decorator, Component } from "cc";
import CCPlatform from "./lib/CCplatform";

const { ccclass, property } = _decorator;
@ccclass("MainScene")
export class MainScene extends CCPlatform {

    onBtnClick(key: string, this_: this): void {
        console.log(key, this_);
    }
}