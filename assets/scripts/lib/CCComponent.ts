import { _decorator, Button, Component, NodeEventType } from "cc";

export default abstract class CCComponent extends Component {
    protected onLoad(): void {
        this.node.children.filter(item => {
            if (item.getComponent(Button)) {
                item.on(NodeEventType.TOUCH_START, () => {
                    this.onBtnClick(item.name, this);
                });
            }
        });

    }
    /**所有绑定button的node都会调用 */
    abstract onBtnClick(key: string, this_: typeof this): void;
}