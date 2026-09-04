# Emulator NES 🎮🕹️

一个基于 **Cocos Creator 3.8.8 + TypeScript + JSNES** 的 NES 模拟器实验项目。它负责把 NES ROM 跑起来，并将 JSNES 输出的画面和音频接入 Cocos 场景：

```text
NES ROM 📦
   ↓ fetch ArrayBuffer
JSNES ⚙️
   ├─ Uint32Array 帧缓冲 → Cocos Texture → Sprite 🖼️
   └─ 音频采样 → WebAudio 🔊
```

> ⚠️ 当前项目仍处于原型阶段：ROM 地址、输入映射和部分平台适配还需要继续完善。

## ✨ 当前能力

- ✅ 使用 `jsnes` 加载并运行 NES ROM
- ✅ 创建 `256 × 240` 的 RGBA8888 Cocos Texture
- ✅ 将 JSNES `frameBuffer` 上传到 Sprite，默认按约 `60 FPS` 推进
- ✅ Web 端通过 `WebAudio` 播放左右声道采样
- ✅ 抽象 `Net` / `Audio` 接口，预留 Web 与微信小游戏实现
- ✅ 统一处理 ROM 魔数校验和加载失败日志
- 🚧 Cocos 按钮回调目前只打印日志，尚未完成手柄按键映射
- 🚧 微信小游戏网络实现已存在，但主流程当前仍默认使用 Web 实现

## 🧰 技术栈

| 技术 | 用途 |
| --- | --- |
| Cocos Creator 3.8.8 | 场景、组件、Sprite 和 Texture 管理 |
| TypeScript | 模拟器接入与平台抽象 |
| [JSNES](https://github.com/bfirsh/jsnes) | NES CPU、PPU、音频和 ROM 模拟 |
| Web Fetch API | Web 端下载 ROM 二进制数据 |
| Web Audio API | Web 端输出 NES 音频 |

## 🚀 开始运行

### 1. 环境准备

安装以下工具：

- Cocos Creator `3.8.8` 🧩
- Node.js 与 npm 📦
- 一个可以提供 `.nes` 文件的本地 HTTP 服务 🌐

### 2. 安装依赖

在仓库根目录执行：

```bash
npm install
```

项目没有额外的 npm scripts，主要通过 Cocos Creator 打开和构建。

### 3. 准备 ROM 服务

当前代码默认从下面的地址加载 ROM：

```text
http://127.0.0.1:8081/static/Adventure_Island_(USA).nes
```

请保证该文件真实存在，并让本地静态文件服务监听 `8081` 端口。也可以修改 `assets/scripts/SceneDesplay.ts` 中的 `ROM_URL`，指向自己的 ROM 地址。

> ⚖️ 请仅使用自己拥有或获授权使用的 ROM。项目本身不包含 ROM 文件。

### 4. 使用 Cocos Creator 启动

1. 使用 Cocos Creator `3.8.8` 打开本仓库。
2. 打开 `assets/main.scene`。
3. 确认场景中的 Sprite 已绑定到 `SceneDesplay.sprite` 属性。
4. 点击 **预览 / 运行** ▶️。
5. 打开控制台查看 `[NES]` 初始化、ROM 加载和运行日志。

## 🗂️ 目录结构

```text
assets/
├─ main.scene                         # 主场景
└─ scripts/
   ├─ MainScene.ts                    # 主场景按钮回调入口
   ├─ SceneDesplay.ts                 # NES 核心显示与运行循环
   ├─ interface/
   │  ├─ Audio.ts                     # 音频抽象接口
   │  ├─ Net.ts                       # 网络抽象接口
   │  └─ implements/
   │     ├─ web/WebAudio.ts           # Web Audio 实现
   │     ├─ web/WebNet.ts             # Fetch 实现
   │     └─ wechat/WechatNet.ts       # 微信小游戏 wx.request 实现
   └─ lib/
      └─ CCComponent.ts               # Cocos 按钮事件绑定基类
build/                                # Cocos 构建产物
library/                              # Cocos 导入资源缓存
temp/                                 # Cocos 临时文件
types/                                # 项目类型声明
```

## 🧠 核心流程

`SceneDesplay` 的工作顺序如下：

1. `onLoad()` 创建 Web 网络和音频实现。
2. `start()` 创建黑屏 Texture，并开始加载 ROM。
3. 校验 ROM 前 4 个字节是否为 iNES 魔数 `NES\x1A`。
4. 创建 `jsnes.NES`，接收画面帧和音频采样。
5. 每帧把 `0x00RRGGBB` 补成带 Alpha 的像素，上传给 Cocos Texture。
6. Cocos `update(dt)` 累计时间，每约 `1 / 60` 秒调用一次 `nes.frame()`。

## 🕹️ 输入映射现状

当前 `MainScene.onBtnClick()` 只会输出按钮名称和组件实例：

```ts
onBtnClick(key: string, this_: this): void {
    console.log(key, this_);
}
```

因此仓库目前还没有完成 A、B、方向键、Start、Select 等 NES 控制器映射。后续可以在这里根据按钮名称调用 JSNES 的按键接口，实现按下与释放事件。

## 🐛 常见问题

### 页面黑屏

- 检查 Sprite 是否已绑定到 `SceneDesplay.sprite`。
- 检查 ROM URL 是否可以在浏览器直接访问。
- 检查 ROM 是否是有效的 iNES 文件。
- 查看控制台是否出现 `ROM 加载失败` 或 `FrameBuffer 长度错误`。

### ROM 加载失败或跨域

ROM 通过浏览器 `fetch` 获取，静态服务器需要允许当前预览页面的跨域请求（CORS）。同时确认服务返回的是二进制文件，而不是 HTML 错误页。

### 没有声音

浏览器可能会阻止未经过用户交互的音频上下文。先点击页面或游戏区域，再检查浏览器音频权限和控制台日志。🔊

### 微信小游戏无法直接运行

微信平台需要使用 `WechatNet`，并将 ROM 服务器域名加入合法域名配置；同时还需要根据 Cocos 的平台构建流程接入对应实现。📱

## 🛠️ 后续计划

- [ ] 完成 NES 手柄按键映射
- [ ] 将 ROM 地址改为可配置项
- [ ] 增加暂停、重置和切换 ROM 功能
- [ ] 完善微信小游戏平台切换
- [ ] 增加 ROM 加载进度和错误提示界面
- [ ] 优化音频缓冲与移动端兼容性
- [ ] 增加基础运行检查和回归测试

## 📜 许可与 ROM 说明

本仓库代码使用的第三方依赖请遵循其各自许可证。ROM 文件可能受版权保护，仓库不提供任何 ROM，也不建议在未经授权的情况下分发或使用 ROM。🔒

---

愿每一次 `frame()` 都稳定输出，愿每一发跳跃都不掉帧！🚀🎮