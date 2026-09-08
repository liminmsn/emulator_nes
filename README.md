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
- 音频输出：通过 `onAudioSample` 推送 PCM 音频
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
- `emulateSound: true`
- 每帧音频采样通过 `onAudioSample` 回调进行输出
- 由项目的 `audio` 类统一处理播放

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

项目默认读取远程资源地址：

```ts
static baseUrl = "http://127.0.0.1:8081";
```

这意味着你需要提供一个本地静态资源服务，确保如下资源可访问：

- `http://127.0.0.1:8081/static/game_list.json`
- `http://127.0.0.1:8081/static/rom/*.nes`

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

### 5.2 🌍 启动本地静态服务器

建议使用任意本地静态文件服务器（如 Python、Node 或 Nginx）来托管 `static` 目录，使浏览器能够成功访问：

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
    static baseUrl = "http://127.0.0.1:8081";
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

```ts
private readonly ROM_URL: string = 'http://127.0.0.1:8081/static/rom/Adventure_Island_(USA).nes';
```

此处为默认演示 ROM 地址。实际项目中可改为从列表中传入的动态 URL。当前代码中也保留了注释形式：

```ts
// private readonly ROM_URL: string = CCGameData.ROM_URL;
```

这说明在正式使用时，推荐从全局数据中读取当前选中的 ROM 路径。

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
    emulateSound: true,
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
private readonly FRAME_INTERVAL: number = 1 / 60;
```

这使模拟器以大约 60 FPS 的节奏推进 NES 运行。

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
- `emulateSound` 未开启
- 浏览器或平台限制了音频播放
- `audio.start()` 未执行

解决办法：
- 确认 `this.audio.start()` 已调用
- 在浏览器中手动允许音频播放
- 检查 `onAudioSample` 是否有数据进入

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

如果你需要进一步扩展功能（如按键映射、存档、暂停、重启、手柄支持等），可以在现有结构上继续补充输入管理与状态恢复模块。