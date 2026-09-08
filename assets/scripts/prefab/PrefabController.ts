import { _decorator, Button, EventTouch, input, Input, Node, NodeEventType, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import CCcomponent from '../lib/CCcomponent';
const { ccclass, type } = _decorator;

@ccclass('PrefabController')
export class PrefabController extends CCcomponent {
    @type(Button)
    btns: Button[];
    @type(Node)
    bar: Node;
    @type(Node)
    barBg: Node;
    targetPos: Vec3;
    boundary = 0;

    start() {
        this.convertToNodeSpaceARNode = this.barBg;
        this.boundary = this.barBg.getComponent(UITransform).height / 2;
        input.on(Input.EventType.TOUCH_START, this.onSTARTMOVE.bind(this));
        input.on(Input.EventType.TOUCH_MOVE, this.onSTARTMOVE.bind(this));
        input.on(Input.EventType.TOUCH_END, () => {
            this.bar.setPosition(Vec3.FORWARD);
            this.bar.setScale(v2(1, 1).toVec3());
            this.targetPos = null;
        });
        this.btns.forEach(btn => {
            btn.node.on(NodeEventType.TOUCH_START, () => this.onBtnClick(btn.node.name, this));
        });

    }

    update(deltaTime: number) {
        if (this.targetPos) {
            this.bar.setScale(v2(1.2, 1.2).toVec3())
            this.bar.setPosition(this.targetPos);
            const { x, y } = v3().subtract(this.targetPos).multiplyScalar(-1).normalize().toVec2();

        }
    }

    onSTARTMOVE(event: EventTouch) {
        const target_pos = this.convertToNodeSpaceAR(event.getUILocation());
        const dir = v3().subtract(target_pos).multiplyScalar(-1).normalize(); //方向
        const distance = Vec2.distance(Vec3.ONE, target_pos); //两点距离 
        if (distance > this.boundary) {
            this.targetPos = v3(1, 1, 1).add(dir.multiplyScalar(this.boundary));
            return;
        }
        this.targetPos = target_pos;
    }

    onBtnClick(key: string, this_: this) {
        console.log(key);
    }
}