import { _decorator, Button, EventTouch, Input, Node, NodeEventType, UITransform, v3, Vec2, Vec3 } from 'cc';
import CCcomponent from '../lib/CCcomponent';
import { Controller, NES } from 'jsnes';
const { ccclass, type } = _decorator;

@ccclass('PrefabController')
export class PrefabController extends CCcomponent {
    @type(Button)
    btns: Button[];
    @type(Node)
    bar: Node;
    @type(Node)
    barBg: Node;

    targetDir: Vec2;
    targetPos: Vec3;
    boundary = 0;

    start() {
        this.convertToNodeSpaceARNode = this.barBg;
        this.boundary = this.barBg.getComponent(UITransform).height / 2;
        this.barBg.on(Input.EventType.TOUCH_START, this.onSTARTMOVE.bind(this));
        this.barBg.on(Input.EventType.TOUCH_MOVE, this.onSTARTMOVE.bind(this)); //已知问题微信小程序会出现声音画面不协调卡帧问题
        this.barBg.on(Input.EventType.TOUCH_END, this.onOVER.bind(this));
        this.barBg.on(Input.EventType.TOUCH_CANCEL, this.onOVER.bind(this));
        this.btns.forEach(btn => {
            btn.node.on(NodeEventType.TOUCH_START, () => this.onBtnClick(btn.node.name, this));
            btn.node.on(NodeEventType.TOUCH_END, () => this.onBtnUp(btn.node.name));
        });

    }

    update(deltaTime: number) {
        if (this.targetPos) {
            // this.bar.setScale(v2(1.2, 1.2).toVec3())
            this.bar.setPosition(this.targetPos);

            // 摇杆
            if (this.targetDir) {
                this.onXY(this.targetDir);
            }
        }
    }

    onOVER() {
        this.bar.setPosition(Vec3.FORWARD);
        // this.bar.setScale(v2(1, 1).toVec3());
        this.targetPos = null;
        this.targetDir = null;

        this.previousPressed.forEach(key => {
            this.onBtnUp(key);
        });
        this.previousPressed = [];
    }

    onSTARTMOVE(event: EventTouch) {
        const target_pos = this.convertToNodeSpaceAR(event.getUILocation());
        const dir = v3().subtract(target_pos).multiplyScalar(-1).normalize(); //方向
        const distance = Vec2.distance(Vec3.ONE, target_pos); //两点距离 

        this.targetDir = dir.toVec2();
        if (distance > this.boundary) {
            this.targetPos = v3(1, 1, 1).add(dir.multiplyScalar(this.boundary));
            return;
        }
        this.targetPos = target_pos;
    }

    private previousPressed: string[] = [];
    onXY(dir: Vec2) {
        const { x, y } = dir;
        const nextPressed: string[] = [];
        const speed = 0.3; //按钮死角
        if (x < speed * -1) nextPressed.push('LEFT');
        if (x > speed) nextPressed.push('RIGHT');
        if (y > (speed + 0.3)) nextPressed.push('UP');
        if (y < (speed + 0.2) * -1) nextPressed.push('DOWN');

        this.previousPressed.forEach(key => {
            if (!nextPressed.includes(key)) {
                this.onBtnUp(key);
            }
        });
        nextPressed.forEach(key => {
            if (!this.previousPressed.includes(key)) {
                this.onBtnClick(key, this);
            }
        });
        this.previousPressed = nextPressed;
    }

    private nes: NES | null = null;
    private btnKey = {
        btn_a: [1, Controller.BUTTON_A],
        btn_b: [1, Controller.BUTTON_B],
        btn_start: [1, Controller.BUTTON_START],
        btn_select: [1, Controller.BUTTON_SELECT],
        LEFT: [1, Controller.BUTTON_LEFT],
        RIGHT: [1, Controller.BUTTON_RIGHT],
        DOWN: [1, Controller.BUTTON_DOWN],
        UP: [1, Controller.BUTTON_UP],

    }
    setNes(nes: NES | null) {
        this.nes = nes;
    }
    onBtnClick(key: string, this_: this) {
        if (!this.nes) return;
        const btn = this.btnKey[key];
        this.nes.buttonDown(btn[0], btn[1]);
    }
    onBtnUp(key: string) {
        if (!this.nes) return;
        const btn = this.btnKey[key];
        this.nes.buttonUp(btn[0], btn[1]);
    }
}