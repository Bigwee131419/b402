// api/mint.js  —— Vercel Serverless Function，返回合规的 402 响应
export default async function handler(req, res) {
    // === 你可以改动的参数 ===
    const NETWORK = "bsc"; // BSC 主网
    const USD1 = "0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d"; // USD1 token
    const PAY_TO = "0x09dfe81b865839f0b522bc8a68add76ba7e9f24c"; // ← 换成你的收款地址（校验为 0x... 格式）
    const AMOUNT_USD1 = "3";                // 单价 3 USD1
    const TIMEOUT_SEC = 1800;               // 30 分钟有效
    // === 计算：b402 使用 6 位小数 ===
    const maxAmountRequired = (Math.round(parseFloat(AMOUNT_USD1) * 1e6)).toString();
  
    // 推断当前 URL（Vercel 生产环境会带 VERCEL_URL；本地/预览也能工作）
    const host = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;
    const resourceUrl = `${host}/api/mint`;
  
    const x402 = {
      x402Version: 1,
      accepts: [{
        scheme: "exact",
        network: NETWORK,
        maxAmountRequired,                   // "3000000" 表示 3 USD1
        resource: resourceUrl,               // 必须写成你当前这个 /mint 的完整 URL
        description: "b402 payment to mint (3 USD1)",
        mimeType: "application/json",
        payTo: PAY_TO,
        maxTimeoutSeconds: TIMEOUT_SEC,
        asset: USD1,
  
        // 可选：声明被付费端点的输入输出（这里举例 POST，无参数）
        outputSchema: {
          input: {
            type: "http",
            method: "POST",
            bodyType: "json",
            bodyFields: {}    // 没有额外参数
          },
          output: {
            ok: true,
            message: "mint settled"
          }
        },
  
        // 可选：自定义字段
        extra: {
          project: "b402NFT",
          priceHuman: `${AMOUNT_USD1} USD1`
        }
      }]
    };
  
    res
      .status(402) // **重点：必须是 402**
      .setHeader("Content-Type", "application/json")
      // 可选：允许调试时跨域访问
      .setHeader("Access-Control-Allow-Origin", "*")
      .send(JSON.stringify(x402));
  }
  