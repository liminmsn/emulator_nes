import * as jsnes from 'jsnes';
import { _decorator, Sprite, SpriteFrame, Texture2D, Rect, } from 'cc';
import Audio from './interface/Audio';
import CCPlatform from './lib/CCplatform';
import WebAudio from './interface/impl/web/WebAudio';
const { ccclass, property } = _decorator;

@ccclass('SceneDesplay')
export class SceneDesplay extends CCPlatform {
    @property(Sprite)
    public sprite: Sprite = null!;

    private nes: jsnes.NES | null = null;
    private nesaudio: Audio | null = null;
    private texture: Texture2D | null = null;
    private spriteFrame: SpriteFrame | null = null;

    protected async start() {
        console.log('[NES] 初始化');
        this.createTexture();
        await this.loadROM();
    }

    // ============================================================
    // FPS
    // ============================================================
    private readonly FRAME_INTERVAL: number = 1 / 60;
    private frameAccumulator: number = 0;
    private frameCount: number = 0;
    protected update(dt: number) {
        if (!this.isReady || !this.nes) {
            return;
        }
        // ------------------------------------------------------------
        // 累计时间
        // ------------------------------------------------------------
        this.frameAccumulator += dt;
        // ------------------------------------------------------------
        // 不足一帧
        // ------------------------------------------------------------
        if (this.frameAccumulator < this.FRAME_INTERVAL) {
            return;
        }
        // ------------------------------------------------------------
        // 消费时间
        // ------------------------------------------------------------
        this.frameAccumulator = this.frameAccumulator % this.FRAME_INTERVAL;
        // ------------------------------------------------------------
        // NES Frame
        // ------------------------------------------------------------
        try {
            this.nes.frame();
        } catch (error) {
            console.error('[NES] frame() 错误:', error);
            this.isReady = false;
        }
    }

    // ============================================================
    // NES 状态
    // ============================================================
    private isReady: boolean = false;
    // ============================================================
    // 加载 ROM
    // ============================================================
    private readonly ROM_URL: string = 'http://127.0.0.1:8081/static/Adventure_Island_(USA).nes';
    async loadROM(): Promise<void> {
        console.log('[NES] 开始加载 ROM:', this.ROM_URL);
        try {
            const romBuffer = await this.net.fetchArrayBuffer(this.ROM_URL);
            console.log('[NES] ROM ArrayBuffer:', romBuffer.byteLength, 'bytes');
            // ========================================================
            // ROM 最小长度
            // ========================================================
            if (romBuffer.byteLength < 16) {
                throw new Error('ROM 文件过小');
            }

            const header: Uint8Array = new Uint8Array(romBuffer, 0, 16);

            console.log('[NES] iNES Header:', Array.from(header).map((value: number) => value.toString(16).padStart(2, '0')).join(' '));
            // ========================================================
            // NES 魔数
            // ========================================================
            if (header[0] !== 0x4e || header[1] !== 0x45 || header[2] !== 0x53 || header[3] !== 0x1a) {
                throw new Error('不是有效的 NES ROM');
            }


            // ========================================================
            // 创建 音频输出
            // ========================================================
            this.nesaudio = new WebAudio();
            this.nesaudio.start();
            // ========================================================
            // 创建 JSNES
            // ========================================================
            this.nes = new jsnes.NES({
                onFrame: (frameBuffer: Uint32Array): void => {
                    this.frameCount++;
                    this.updateTexture(frameBuffer);
                    // if (this.frameCount === 1 || this.frameCount % 60 === 0) {
                    //     console.log('[NES] Frame:', this.frameCount);
                    // }
                },
                onAudioSample: (l, r): void => this.nesaudio.push(l, r),
                emulateSound: true,
            });
            this.nes.loadROM(romBuffer);
            console.log('[NES] ROM loadROM 成功');
            this.isReady = true;
            // ========================================================
            // 立即运行第一帧
            // ========================================================
            this.nes.frame();
            console.log('[NES] 模拟器启动成功');
        } catch (error) {
            console.error('[NES] ROM 加载失败:', error);
            this.isReady = false;
            this.nes = null;
        }
    }

    // ============================================================
    // 创建 Texture
    // ============================================================
    // ============================================================
    // 显示 Buffer
    //
    // 这里必须使用和 JSNES 官方 Canvas 渲染相同的结构：
    //
    // ArrayBuffer
    //     ↓
    // Uint8Array
    //     ↓
    // Uint32Array
    //
    // Uint32Array 用于写入：
    //
    // 0xFF000000 | frameBuffer[i]
    //
    // Uint8Array 用于上传到 Texture。
    // ============================================================
    private static readonly WIDTH: number = 256;
    private static readonly HEIGHT: number = 240;
    private static readonly PIXEL_COUNT: number = SceneDesplay.WIDTH * SceneDesplay.HEIGHT;
    private readonly displayBuffer: ArrayBuffer = new ArrayBuffer(SceneDesplay.PIXEL_COUNT * 4);
    private readonly displayU8: Uint8Array = new Uint8Array(this.displayBuffer);
    private readonly displayU32: Uint32Array = new Uint32Array(this.displayBuffer);
    createTexture(): void {
        console.log('[NES] 创建 Texture');
        this.texture = new Texture2D();

        // ------------------------------------------------------------
        // 初始化 256x240 RGBA8888
        // ------------------------------------------------------------
        this.texture.reset({
            width: SceneDesplay.WIDTH,
            height: SceneDesplay.HEIGHT,
            format: Texture2D.PixelFormat.RGBA8888,
        });

        // ------------------------------------------------------------
        // 初始化黑屏
        // ------------------------------------------------------------
        this.displayU8.fill(0);
        // Alpha = 255
        //
        // 防止 Sprite 透明
        //
        for (let i = 3; i < this.displayU8.length; i += 4) {
            this.displayU8[i] = 255;
        }
        // ------------------------------------------------------------
        // 上传初始画面
        // ------------------------------------------------------------
        this.texture.uploadData(this.displayU8);
        // ------------------------------------------------------------
        // 创建 SpriteFrame
        // ------------------------------------------------------------
        this.spriteFrame = new SpriteFrame();
        // Texture
        this.spriteFrame.texture = this.texture;
        // ------------------------------------------------------------
        // 设置完整 Texture Rect
        // ------------------------------------------------------------
        this.spriteFrame.rect = new Rect(0, 0, SceneDesplay.WIDTH, SceneDesplay.HEIGHT);
        // ------------------------------------------------------------
        // 设置 Sprite
        // ------------------------------------------------------------
        this.sprite.spriteFrame = this.spriteFrame;
        this.sprite.enabled = true;
        console.log('[NES] Texture 创建完成');
    }

    // ============================================================
    // JSNES FrameBuffer → Cocos Texture
    // ============================================================
    //
    // 这里是整个代码最关键的地方。
    //
    // JSNES 的官方 Canvas 用法本质上是：
    //
    // framebuffer32[i] =
    //     0xff000000 | frameBuffer[i];
    //
    // 然后：
    //
    // imageData.data.set(
    //     framebuffer8
    // );
    //
    // JSNES 的 framebuffer 数值是：
    //
    // 0x00RRGGBB
    //
    // 补 Alpha：
    //
    // 0xFFRRGGBB
    //
    // 但是 Uint32Array 在 Android/Web 的常见小端环境
    // 中内存实际排列为：
    //
    // BB GG RR FF
    //
    // 这正是浏览器 ImageData 使用的底层布局路径。
    //
    // 因此这里不再手动：
    //
    // R = color >>> 16
    // G = color >>> 8
    // B = color
    //
    // 而是完全按照 JSNES 官方 framebuffer 方式处理。
    //
    // ============================================================
    updateTexture(frameBuffer: Uint32Array): void {
        if (!this.texture) {
            return;
        }

        // ------------------------------------------------------------
        // FrameBuffer 长度
        // ------------------------------------------------------------
        if (frameBuffer.length < SceneDesplay.PIXEL_COUNT) {
            console.error('[NES] FrameBuffer 长度错误:', frameBuffer.length);
            return;
        }

        // ------------------------------------------------------------
        // 直接转换
        // ------------------------------------------------------------
        for (let i = 0; i < SceneDesplay.PIXEL_COUNT; i++) {
            /**
             * JSNES framebuffer：
             *
             * 0x00RRGGBB
             *
             * 补 Alpha：
             *
             * 0xFFRRGGBB
             */
            this.displayU32[i] = (frameBuffer[i] | 0xff000000) >>> 0;
        }

        // ------------------------------------------------------------
        // 上传底层 Uint8 数据
        // ------------------------------------------------------------
        this.texture.uploadData(this.displayU8);
    }

    getNES(): jsnes.NES | null {
        return this.nes;
    }

    isRunning(): boolean {
        return this.isReady;
    }

    getFrameCount(): number {
        return this.frameCount;
    }

    onDestroy(): void {
        this.texture = null;
        this.isReady = false;
        this.spriteFrame = null;
        this.frameAccumulator = 0;
        this.frameCount = 0;
        this.nes = null;
        console.log('[NES] 销毁');
        this.nesaudio = null;
        this.nesaudio.destroy();
    }

    onBtnClick(key: string, this_: this): void {

    }
}
