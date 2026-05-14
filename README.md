# Albireo

## 概要

スマホで、YouTube動画にバイリンガル字幕を表示して視聴するためのWebアプリケーション。

[https://ky0ta168.github.io/albireo/](https://ky0ta168.github.io/albireo/)

## 使い方

字幕データのフォーマットは2種類に対応しています。

### JSON (kotodama) を利用する場合

1. PCブラウザでYouTube動画を開き、自前のブックマークレット「kotodama」を実行
2. 字幕をOFF→ONに切り替え、「Albireo用JSONをダウンロード」を押下
3. JSONをスマホでダウンロード
4. Albireoにアクセスし、「Save」を押下
5. JSONを選択 (ID・タイトルはJSONから自動入力) し、「Save」を押下
6. 動画のサムネイルを押下することで、字幕付きで動画を視聴

### Excel (Language Reactor) を利用する場合

1. PCのChrome拡張機能「[Language Reactor](https://www.languagereactor.com/)」でYouTube動画の翻訳データをExcelで出力
2. YouTube動画のID、およびタイトルをメモ
    - YouTube動画のIDは、`https://www.youtube.com/watch?v=4Az9x5nkTTs`の場合`4Az9x5nkTTs`など
    - 共有からURLを取得した場合は、`https://youtu.be/4Az9x5nkTTs`のようなURLになるので注意
3. GoogleDriveなどを利用し、翻訳データのExcelをスマホでダウンロード
4. Albireoにアクセスし、「Save」を押下
5. ID、タイトル、Excelを入力し、「Save」を押下
6. 動画のサムネイルを押下することで、字幕付きで動画を視聴

## 補足

保存した動画はブラウザのローカルストレージに保存されます。

そのため、ブラウザや別端末ではデータの共有はできません。

## 開発

### 技術スタック

- React 19 + TypeScript
- Vite (ビルド / dev サーバ)
- Deno (パッケージマネージャ / タスクランナー)
- MUI v6

### セットアップ

```sh
deno install
```

### コマンド

| コマンド | 内容 |
| --- | --- |
| `deno task dev` | 開発サーバ起動 (http://localhost:5173/albireo/) |
| `deno task typecheck` | `tsc --noEmit` で型チェック |
| `deno task build` | 型チェック後、`docs/` へ本番ビルド |
| `deno task preview` | ビルド成果物のローカルプレビュー |
| `deno task deploy` | ビルドして `main` にコミット & プッシュ (GitHub Pages 公開) |

### xlsx について

`xlsx` (SheetJS) は npm 公開を停止しているため、CDN の ESM ビルドを `vendor/xlsx.mjs` に同梱し、`vite.config.js` のエイリアスで解決しています。更新する場合は SheetJS CDN から再ダウンロードしてください。
