# 🔍 DohEchCheckPages - Cloudflare DoH & ECH 在线双重可用性检测平台

[![Cloudflare Worker](https://img.shields.io/badge/Cloudflare-Worker%20Serverless-F38020?logo=cloudflare)](https://workers.cloudflare.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

本项目基于 [dong-dong6/DohEchCheckPages](https://github.com/dong-dong6/DohEchCheckPages) 完整源码部署构建，提供在线可视化的 **DNS-over-HTTPS (DoH)** 与 **Encrypted Client Hello (ECH)** 双重可用性对比探测与质量评估。

---

## 🌐 线上服务入口

- **检测服务主站**：[https://doh-ech-check.205.dpdns.org/](https://doh-ech-check.205.dpdns.org/)
- **检测 API 接口**：`https://doh-ech-check.205.dpdns.org/api/check` (POST)

---

## 🛠️ 核心功能特性

1. **DoH 可用性与真实度多源比对**：
   - 支持向目标 DoH 接口、**Cloudflare 官方权威** (`https://cloudflare-dns.com/dns-query`)、**Google 官方权威** (`https://dns.google/resolve`) 并发发起 DNS 查询。
   - 自动分析解析结果 IP 列表，检测是否存在 DNS 污染、解析劫持或结果偏差。
   - 测试包含 **RFC 8484 (WireFormat)** 与 **JSON** 两种传输格式，同时精确统计各节点毫秒级往返时延 (RTT)。
2. **ECH (Encrypted Client Hello) 部署校验**：
   - 自动查询域名的 **HTTPS 记录 (Type 65)**，验证是否具备有效的 ECH 参数与公钥指纹。
   - 直观展示目标网站是否具备防 SNI 阻断与 TLS 全加密握手能力。

---

## 🚀 本地自动化构建与部署

项目已内置自动化部署脚本 `deploy.js`，支持自动编译 TypeScript 并调用 Cloudflare API 发布至全球边缘网络：

```bash
# 1. 安装依赖
npm install

# 2. 编译 TypeScript 并一键部署到 Cloudflare
node deploy.js
```

---

## 📡 API 调用示例

### 1. 检测 DoH 服务可用性
```bash
curl -X POST https://doh-ech-check.205.dpdns.org/api/check \
  -H "Content-Type: application/json" \
  -d "{\"mode\":\"doh\",\"target\":\"https://doh.205.dpdns.org/api/v1/network/gateway\"}"
```

### 2. 检测目标网站 ECH 启用状态
```bash
curl -X POST https://doh-ech-check.205.dpdns.org/api/check \
  -H "Content-Type: application/json" \
  -d "{\"mode\":\"ech\",\"target\":\"cloudflare.com\"}"
```

---

## 📄 License
MIT License © 2026 YunWu Cloud Technologies.