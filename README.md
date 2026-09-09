# 🎮 NES 模拟器项目说明

这是一个基于 Cocos Creator 3.x + jsnes 的 NES 游戏模拟器演示项目，用于在 Web / 小程序等平台中加载并运行 NES ROM 文件，并将画面渲染到 Cocos 2D 场景中。

> ✨ 项目亮点：从 ROM 列表到游戏渲染，再到音频输出，整套流程已经串起来了，适合学习 NES 仿真与 Cocos 集成。

项目核心逻辑主要包含：
- 🎯 通过 HTTP 请求获取游戏列表
- 📦 下载并解析 NES ROM
- 🧠 使用 jsnes 进行 CPU / PPU / 音频模拟
- 🖼️ 将 FrameBuffer 转成 Cocos Texture 并显示在 Sprite 上
- 🎲 提供游戏卡片列表与场景切换逻辑

---

## 1. 🚀 项目简介

该项目采用 Cocos Creator 开发，依赖 `jsnes` 库实现真实的 NES 模拟器能力。运行时会读取本地或远程服务器中的 ROM 文件，并在场景中播放对应游戏内容。

从代码实现看，项目支持以下几个关键能力：
- 游戏列表获取：通过 `getGameList()` 请求 JSON 数据
- ROM 资源加载：通过 `fetchArrayBuffer()` 下载 `.nes` 文件
- 图像输出：JSNES 的 `frameBuffer` 映射到 Cocos 的 `Texture2D`
- 音频输出：保留 `onAudioSample` 音频回调和 WebAudio 实现；当前 `emulateSound` 配置已注释
- 场景管理：从首页选择游戏，跳转到 `nes` 场景运行

---

## 2. ⚙️ 功能特性

### 2.1 🎮 游戏列表页
- 首页中展示 ROM 列表
- 每个游戏以卡片形式展示
- 点击卡片后跳转到游戏运行场景

### 2.2 📥 ROM 加载与校验
- 请求 `.nes` 文件
- 检查文件头是否为合法的 iNES 标识：`4E 45 53 1A`
- 对非法 ROM 进行错误处理

### 2.3 🖼️ 画面渲染
- JSNES 输出的 `frameBuffer` 会被转换成 RGBA8888
- 通过 `Texture2D.uploadData()` 实时更新显示内容
- 输出分辨率固定为 `256 x 240`

### 2.4 🔊 音频模拟
- `SceneNes` 会调用 `audio.start()` 创建 WebAudio 输出链
- `onAudioSample` 回调负责把左右声道采样写入音频环形缓冲区
- 当前 `new jsnes.NES()` 中的 `emulateSound` 配置被注释，需要实际测试平台是否产生音频采样
- 离开 NES 场景时由 `WebAudio.destroy()` 断开节点并关闭 `AudioContext`

### 2.5 🌐 平台兼容
- 代码结构中存在 `web` 与 `wechat` 两种网络实现层
- 可扩展到浏览器或微信小游戏等环境

---

## 3. 🧩 技术栈

- Cocos Creator：3.8.8
- TypeScript
- jsnes：^2.1.0
- Web / 小程序网络接口抽象

依赖配置见 `package.json`：

```json
{
  "name": "emulator_nes",
  "dependencies": {
    "jsnes": "^2.1.0"
  }
}
```

---

## 4. 📁 项目结构说明

```text
emulator_nes/
├── assets/
│   ├── scripts/
│   │   ├── SceneMain.ts        # 游戏列表页
│   │   ├── SceneNes.ts         # NES 渲染与运行主逻辑
│   │   ├── lib/
│   │   │   ├── CCNetConfig.ts  # 接口地址配置
│   │   │   ├── CCGameData.ts   # 全局缓存
│   │   │   └── ...
│   │   ├── interface/
│   │   │   ├── Net.ts
│   │   │   └── impl/
│   │   └── prefab/
│   │       └── Card.ts
│   └── ...
├── build/
├── library/
├── package.json
├── tsconfig.json
├── README.md
└── ...
```

关键文件说明：
- `assets/scripts/SceneNes.ts`：最核心的模拟器入口，负责初始化 jsnes、加载 ROM、渲染帧画面、处理音频
- `assets/scripts/SceneMain.ts`：首页加载逻辑，拉取游戏列表并切换到指定 ROM
- `assets/scripts/lib/CCNetConfig.ts`：统一配置服务端地址
- `assets/scripts/interface/impl/web/WebNet.ts`：浏览器端网络实现

---

## 5. ▶️ 运行方式

### 5.1 🧰 准备资源

项目默认读取远程资源地址【仅限开发可用】（当前配置见 `assets/scripts/lib/CCNetConfig.ts`）：

```ts
static baseUrl = "https://env-00jy6p6k7nu9-static.normal.cloudstatic.cn";
```

因此默认需要确保以下远程资源可访问：

- `${baseUrl}/static/game_list.json`
- `${baseUrl}/static/rom/*.nes`

示例资源列表 JSON 格式大致如下：

```json
[
  {
    "name": "Adventure Island",
    "img": "/static/img/adventure_island.png",
    "file": "/static/rom/Adventure_Island_(USA).nes"
  }
]
```

### 5.2 🌍 使用本地静态服务器（可选）

如果需要改为本地资源，可使用任意静态文件服务器（如 Python、Node 或 Nginx）托管 `static` 目录，并同步修改 `CCNetConfig.baseUrl`：

```bash
python -m http.server 8081
```

如果是项目本身已配套静态资源目录，则将资源放到对应的 `static` 路径下，并确保端口与 `CCNetConfig.baseUrl` 保持一致。

### 5.3 🕹️ 在 Cocos Creator 中打开项目

1. 打开 Cocos Creator 3.8.8
2. 导入当前项目目录
3. 进入主场景并运行预览
4. 主页会自动请求 `game_list.json`
5. 点击游戏卡片后，加载对应 ROM 并进入 `nes` 场景

---

## 6. ⚙️ 配置说明

### 6.1 🌐 网络配置

文件：`assets/scripts/lib/CCNetConfig.ts`

```ts
export default class {
    static baseUrl = "https://env-00jy6p6k7nu9-static.normal.cloudstatic.cn";
    static game_list = `${this.baseUrl}/static/game_list.json`;
}
```

如果你要更换服务地址、静态目录或部署环境，需要同步修改这里的 `baseUrl`。

### 6.2 🗂️ 游戏列表缓存

文件：`assets/scripts/lib/CCGameData.ts`

这里用于缓存请求回来的游戏列表，避免重复网络请求。实际流程如下：
- 首次进入首页时调用 `getGameList()`
- 将游戏列表保存到 `gameList`
- 点击某个游戏后将 `ROM_URL` 写入全局数据
- 进入 `nes` 场景后通过 `loadROM()` 加载对应 ROM

### 6.3 🎯 ROM 路径

文件：`assets/scripts/SceneNes.ts`

当前实现使用：

```ts
private readonly ROM_URL: string = CCGameData.ROM_URL;
```

首页点击卡片时，会将 `CCNetConfig.baseUrl + item.file` 写入 `CCGameData.ROM_URL`，随后切换到 `nes` 场景。

---

## 7. 🧠 关键代码实现说明

### 7.1 📥 ROM 加载

`SceneNes.loadROM()` 中会：
- 读取 `ArrayBuffer`
- 判断是否满足 NES 文件头
- 创建 JSNES 实例
- 调用 `this.nes.loadROM(romBuffer)`
- 设置 `onFrame` 和 `onAudioSample` 回调

关键代码流程：

```ts
this.nes = new jsnes.NES({
    onFrame: (frameBuffer: Uint32Array): void => {
        this.updateTexture(frameBuffer);
    },
    onAudioSample: (l, r): void => this.audio.push(l, r),
    // emulateSound: true,
});
this.nes.loadROM(romBuffer);
```

### 7.2 🖼️ 帧渲染

`updateTexture()` 会把 JSNES 输出的 `frameBuffer` 按照相同布局转换为 Cocos 可接受的 `Texture2D` 数据。例如：

- JSNES 帧缓冲使用 `0x00RRGGBB`
- 需要补 alpha 通道，形成 `0xFFRRGGBB`
- 写入 `Uint8Array` 后上传至纹理

### 7.3 ⏱️ 帧同步

`SceneNes.update()` 中通过累积时间控制模拟器刷新频率：

```ts
private readonly FRAME_INTERVAL: number = 1 / 90;
```

这使模拟器以大约 90 FPS 的节奏推进 NES 运行。实际显示帧率仍受设备和 Cocos 调度影响。

### 7.4 🧹 资源生命周期与内存检查

当前实现中需要关注以下资源：

- `SceneNes` 每次创建一个 `Texture2D` 和一个 `SpriteFrame`，离开场景时应先解除 `Sprite.spriteFrame` 引用，再销毁这两个手动创建的对象。
- `WebAudio.destroy()` 会断开 `ScriptProcessorNode`、`GainNode` 并关闭 `AudioContext`；重复进入 NES 场景时应确认该方法被调用。
- `PrefabController` 保存着 `jsnes.NES` 引用，销毁场景前应调用 `setNes(null)`，避免控制器继续持有模拟器实例。
- `loadROM()` 包含异步网络请求。场景销毁后，晚返回的请求不应继续创建 `jsnes.NES` 实例；建议使用请求令牌或取消请求进行保护。
- `displayBuffer`、`displayU8` 和 `displayU32` 是组件固定持有的约 240 KiB CPU 缓冲区，不应在每帧重新创建。

检查方式：反复进入和退出 `nes` 场景，观察 Cocos Profiler 的 JavaScript、Texture 和 Audio 内存是否在多轮操作后持续增长。单次增长可能来自引擎缓存，只有在垃圾回收后仍持续增长才更像泄漏。

---

## 8. ❓ 常见问题

### Q1：ROM 无法加载

可能原因：
- 静态资源服务未启动
- 地址配置错误
- 资源文件不是有效 NES ROM

解决办法：
- 检查 `CCNetConfig.baseUrl`
- 确认 `static/rom` 中文件路径正确
- 确认文件头是否为 `4E 45 53 1A`

### Q2：画面显示黑屏

可能原因：
- `Texture2D` 初始化错误
- `frameBuffer` 长度不符合 `256 * 240`
- `onFrame` 未正常触发

解决办法：
- 检查 `createTexture()` 是否执行成功
- 确认 `updateTexture()` 处理了每一帧数据
- 查看控制台的 `[NES]` 日志

### Q3：音频没有声音

可能原因：
- `SceneNes.ts` 中的 `emulateSound` 配置当前被注释
- 浏览器或平台限制了音频播放
- `audio.start()` 未执行

解决办法：
- 确认 `this.audio.start()` 已调用
- 在浏览器中手动允许音频播放
- 检查 `onAudioSample` 是否有数据进入

### Q4：反复切换场景后内存持续增长

可能原因：
- 自建 `Texture2D` 或 `SpriteFrame` 没有销毁
- `PrefabController` 仍然持有旧的 NES 实例
- ROM 请求在场景销毁后返回，并重新创建模拟器

解决办法：
- 在 `onDestroy()` 中解除 Sprite 的 `spriteFrame` 引用并销毁自建纹理资源
- 调用 `controller.setNes(null)`
- 为 `loadROM()` 增加销毁状态或请求令牌检查
- 使用 Cocos Profiler 在多次场景切换和垃圾回收后复测

---

## 9. 🎯 适用场景

该项目适合以下用途：
- 学习 NES 模拟器原理
- Cocos Creator 与 JSNES 集成实践
- 2D 游戏画面实时渲染案例
- 浏览器端/小程序端仿真游戏演示

---

## 10. ⚠️ 版权与使用说明

- 本项目以教学与学习为主要目的。
- ROM 文件属于第三方游戏资源，使用前请确认具备合法授权。
- 该项目不附带任何商业级 ROM 发行授权。

---

## 11. 📬 联系信息

- 作者微信号：liminmsn