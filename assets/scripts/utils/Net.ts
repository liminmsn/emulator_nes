export default class {
    /**
     * 微信小游戏 wx.request 封装，下载二进制 ArrayBuffer
     */
    static wxFetchArrayBuffer(url: string): Promise<ArrayBuffer> {
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