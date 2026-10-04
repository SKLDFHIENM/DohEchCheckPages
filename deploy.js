/**
 * DohEchCheckPages 自动化部署脚本
 * 运行方式: node deploy.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const email = process.env.CF_EMAIL || "groobett@outlook.com";
const apiKey = process.env.CF_API_KEY || "1bf64dc384410538b8058a5bd5819780af1cd";
const accountId = process.env.CF_ACCOUNT_ID || "0a4c78659b37c2450ead5d49953de2ba";
const zoneId = process.env.CF_ZONE_ID || "3bdfa981991a4dec929187bee6834eba";
const hostname = "doh-ech-check.205.dpdns.org";

async function main() {
  console.log("🔨 正在编译 TypeScript 源码...");
  execSync("npx tsc", { cwd: __dirname, stdio: "inherit" });

  console.log("🚀 正在上传发布 Cloudflare Worker (doh-ech-check)...");
  const jsCode = fs.readFileSync(path.join(__dirname, "src", "worker.js"), "utf8");

  const metadata = {
    main_module: "worker.js",
    compatibility_date: "2024-01-01",
    bindings: [
      { name: "DEFAULT_TEST_DOMAIN", type: "plain_text", text: "linux.do" },
      { name: "REQUEST_TIMEOUT_MS", type: "plain_text", text: "5000" }
    ]
  };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("worker.js", new Blob([jsCode], { type: "application/javascript+module" }), "worker.js");

  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/doh-ech-check`, {
    method: "PUT",
    headers: {
      "X-Auth-Email": email,
      "X-Auth-Key": apiKey
    },
    body: form
  });

  const data = await res.json();
  if (!data.success) {
    console.error("❌ Worker 发布失败:", data.errors);
    return;
  }
  console.log("✅ Worker 发布成功!");

  console.log(`🌐 正在验证绑定自定义域名 ${hostname}...`);
  const bindRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/domains`, {
    method: "PUT",
    headers: {
      "X-Auth-Email": email,
      "X-Auth-Key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      zone_id: zoneId,
      hostname,
      service: "doh-ech-check",
      environment: "production"
    })
  });
  const bindData = await bindRes.json();
  console.log("✅ 域名绑定状态:", bindData.success ? "生效中" : bindData.errors);

  console.log("🧹 正在刷新 Cloudflare 全局缓存...");
  const purgeRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
    method: "POST",
    headers: {
      "X-Auth-Email": email,
      "X-Auth-Key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ purge_everything: true })
  });
  console.log("✅ 全局 CDN 缓存已刷新!");
}

main().catch(console.error);
