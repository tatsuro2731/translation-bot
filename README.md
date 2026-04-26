# あといくら家計簿

個人事業主のための家計簿アプリ。Next.js (App Router) + TypeScript + Tailwind CSS で実装。

## 開発

```bash
npm install
npm run dev
# http://localhost:3000/home
```

## 構成

- `app/(tabs)/home`     ホーム（今月のあといくら）
- `app/(tabs)/history`  履歴
- `app/(tabs)/fixed`    固定費
- `app/(tabs)/analysis` 分析（円グラフ・ランキング）
- `app/input`           支出/収入/振替の入力
- `app/cash`            現金残高ズレ調整
- `lib/store.tsx`       localStorage ベースの状態管理
- `lib/calc.ts`         月次集計・カテゴリ集計など
- `lib/seed.ts`         スクリーンショット相当の初期データ

データは `localStorage` の `atoikura.db.v1` に保存されます。
