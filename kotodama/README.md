# kotodama (言霊)

YouTube動画から字幕とその日本語翻訳を取得し、Albireo用JSONとしてダウンロードするブックマークレット。

## 概要

YouTubeプレイヤーが内部的に取得する `timedtext` 字幕データをインターセプトし、元言語と日本語訳をマージしてJSONとして書き出す。Albireoの「Save」フォームにそのままインポートできる。

## インストール

1. ブラウザのブックマークバーで「新しいブックマーク」を追加
2. 名前は任意 (例: `kotodama`)
3. URL欄に [`bookmarklet.min.js`](./bookmarklet.min.js) の中身 (`javascript:` 始まり) をすべて貼り付けて保存

## 使い方

1. YouTube動画ページ (`https://www.youtube.com/watch?v=...`) を開く
2. ブックマークから `kotodama` を実行 — 右下にパネルが表示される
3. 動画の字幕ボタンを **OFF→ON** に切り替える
    - YouTubeが `timedtext` を取得するタイミングを捕捉するため
    - 既にONなら一度OFFにしてからONにし直す
4. パネルが「取得完了: N 件」と表示されたら「Albireo用JSONをダウンロード」を押下
5. `{videoId}_albireo.json` がダウンロードされる
6. Albireoで「Save」→ファイル選択でこのJSONを読み込ませる

## 出力フォーマット

```json
{
  "id": "動画ID",
  "title": "動画タイトル",
  "subtitles": [
    {
      "startMs": 0,
      "durationMs": 2000,
      "subtitle": "元言語の字幕",
      "translation": "日本語訳"
    }
  ]
}
```

`id` / `title` はAlbireo側で自動入力されるため、手動でメモする必要はない。

## 制限事項

- 翻訳先言語は日本語 (`tlang=ja`) 固定
- 字幕が存在しない動画では取得できない (パネルに「元字幕データが空」等が表示される)
- 多言語の手動字幕のみが付与された動画では、自動翻訳が取得できない場合がある
- YouTubeの内部APIを利用しているため、YouTube側の仕様変更で動作しなくなる可能性あり

## 開発

`bookmarklet.js` が可読版ソース、`bookmarklet.min.js` がブックマーク登録用の `javascript:` URL形式。編集する場合は `bookmarklet.js` を変更後、minify と `javascript:` プレフィックス付与を行う。
