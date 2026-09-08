import { _decorator, Button, Component, NodeEventType, UITransform, Node, v3, Vec2 } from "cc";

export default abstract class CCcomponent extends Component {
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

    convertToNodeSpaceARNode: Node;
    convertToNodeSpaceAR(pos: Vec2) {
        const out = v3();
        if (this.convertToNodeSpaceARNode) {
            this.convertToNodeSpaceARNode.getComponent(UITransform).convertToNodeSpaceAR(pos.toVec3(), out);
        }
        return out;
    }
}