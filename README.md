# あといくら家計簿

個人事業主のための家計簿アプリ（PWA）。Next.js (App Router) + TypeScript + Tailwind CSS。

## 開発

```bash
npm install
npm run dev      # http://localhost:3000/home
npm run build    # production build
npm run start    # production server
npm run icons    # public/icon.svg から各サイズの PNG を再生成
```

データはブラウザの `localStorage` (`atoikura.db.v1`) に保存されます。

## ディレクトリ構成

| パス                                 | 役割                                |
| ------------------------------------ | ----------------------------------- |
| `app/(tabs)/home`                    | ホーム（今月のあといくら）          |
| `app/(tabs)/history`                 | 履歴                                |
| `app/(tabs)/fixed`                   | 固定費                              |
| `app/(tabs)/analysis`                | 分析（円グラフ・ランキング）        |
| `app/input`                          | 支出/収入/振替の入力                |
| `app/cash`                           | 現金残高ズレ調整                    |
| `lib/store.tsx`                      | localStorage ベースの状態管理       |
| `lib/calc.ts`                        | 月次集計・カテゴリ集計              |
| `lib/seed.ts`                        | スクリーンショット相当の初期データ  |
| `public/manifest.webmanifest`        | Web App Manifest                    |
| `public/sw.js`                       | Service Worker (オフライン対応)     |
| `public/icon*.{png,svg}`             | アプリアイコン（180/192/512 等）    |
| `scripts/build-icons.mjs`            | SVG → PNG 生成スクリプト (sharp)    |

## PWA としての対応状況

- ✅ Web App Manifest（`display: standalone`、ショートカット2種）
- ✅ iOS 用 `apple-touch-icon` 180×180、`apple-mobile-web-app-*` メタタグ
- ✅ Android 用 192/512 PNG・maskable アイコン
- ✅ Service Worker（network-first ナビゲーション + stale-while-revalidate アセット）
- ✅ セーフエリア対応（`env(safe-area-inset-*)`）
- ✅ `100svh` でスタンドアローン時のレイアウトずれ抑止
- ✅ ピンチズーム禁止 / 入力時のオートズーム抑止

## iPhone へのインストール手順

1. デプロイ済みのURLを Safari で開く（**HTTPS必須**）
2. 共有ボタン → 「ホーム画面に追加」
3. ホーム画面のアイコンから起動するとフルスクリーンの PWA として動作

> **注意**: SW の登録は production ビルド (`npm run build && npm run start`) または
> Vercel にデプロイした環境でのみ有効です（dev では無効化）。

## デプロイ（Vercel 推奨）

GitHub にこのリポジトリを push 済みであれば:

1. <https://vercel.com/new> で対象リポジトリを Import
2. Framework は自動判定（Next.js）。設定変更不要。
3. Deploy を押して数十秒で `https://*.vercel.app` の URL が発行される
4. その URL を iPhone Safari で開いて「ホーム画面に追加」

CLI 派の場合:

```bash
npm i -g vercel
vercel        # 初回はリンク
vercel --prod # 本番デプロイ
```

その他の選択肢: Cloudflare Pages / Netlify / 自前 VPS（HTTPS必須）。

## 個人事業主向けロジック

- 支出区分: 生活費 / 事業費 / 固定費 / 税金・保険積立 / 按分
- 振替: 区分間の付け替え（例: 生活費 → 事業費）
- 現金ズレ調整: アプリ残高と実残高の差を「生活費として使った」として一括振替
- 月次集計: 収入予定 − 固定費 − 生活費 − 事業費 − 税金積立 = 残り（予想）
