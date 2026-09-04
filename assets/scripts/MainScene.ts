import { _decorator, Component } from "cc";
import { CCComponent } from "./lib/CCComponent";

const { ccclass, property } = _decorator;
@ccclass("MainScene")
export class MainScene extends CCComponent {

    onBtnClick(key: string, this_: this): void {
        console.log(key, this_);
    }
}