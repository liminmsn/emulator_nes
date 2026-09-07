import CCNetConfig from "../../../lib/CCNetConfig";
import Net from "../../Net";
export default class WechatNet implements Net {
    async getGameList(): Promise<GameListType[]> {
        return new Promise((resolve, reject) => {
            wx.request({
                url: CCNetConfig.game_list,
                method: 'GET',
                // json 请求不需要 arraybuffer，微信默认返回 object
                success: (res) => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(res.data as GameListType[]);
                    } else {
                        reject(new Error(`getGameList HTTP 错误: ${res.statusCode}`));
                    }
                },
                fail: (err) => {
                    reject(new Error(`getGameList 请求失败: ${JSON.stringify(err)}`));
                }
            })
        })
    }

    /**
     * 微信小游戏 wx.request 封装，下载二进制 ArrayBuffer
     */
    fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            wx.request({
                url: url,
                method: 'GET',
                // 关键：微信必须指定 responseType:arraybuffer
                responseType: 'arraybuffer',
                success: (res) => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(res.data as ArrayBuffer);
                    } else {
                        reject(new Error(`wx.request HTTP ${res.statusCode}`));
                    }
                },
                fail: (err) => {
                    reject(new Error(`wx.request 失败: ${JSON.stringify(err)}`));
                }
            });
        });
    }
}
