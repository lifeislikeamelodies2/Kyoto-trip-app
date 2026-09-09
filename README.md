# 京都旅行 Webアプリ（GitHub Pages版）

Google Apps Script版を、GitHub Pagesで動く静的Webアプリへ移植したものです。ビルドツールやサーバーは不要です。

## ファイル

- `index.html` … 入口
- `style.css` … 見た目
- `data.js` … TOP画像・観光スポット・食事スポットのデータ
- `app.js` … ページ切替・フィルター・地図リンク等の処理
- `.nojekyll` … GitHub Pages用
- `robots.txt` … 検索エンジン向けクロール抑制
- `README.md` … 管理メモ

## GitHub Pagesで公開する手順

1. `Settings` → `Pages`
2. `Build and deployment` の Source を `Deploy from a branch`
3. Branch を `main`、Folder を `/(root)` にして `Save`
4. 数分後に表示される `https://<ユーザー名>.github.io/<リポジトリ名>/` を開く

## TOP画像を変更する

`data.js` 冒頭の以下2行のファイルIDを変更します。

```js
const TOP_IMAGE_URL = 'https://drive.google.com/thumbnail?id=ファイルID&sz=w1600';
const TOP_IMAGE_FALLBACK_URL = 'https://drive.google.com/uc?export=view&id=ファイルID';
```

Google Drive側は「リンクを知っている全員」「閲覧者」にしてください。

## スポットを追加・変更する

`data.js` の `SPOTS` を編集します。

- `tags`: `['新選組','長州']` のように複数可
- `days`: `[]` は未定。`['1日目']`、`['2日目']` など
- `id`: 英数字で重複しない値

Appleマップ・Google Mapsのリンクは、スポット名と住所から `app.js` 側で自動生成します。

## 食事スポット

現在 `FOOD_SPOTS = []` のため準備中表示です。データが決まったら追加できます。

## 公開情報について

GitHub Pagesを公開リポジトリで運用する場合、`data.js` に書いた内容はインターネット上から閲覧可能です。このGitHub版では宿泊予約番号は掲載していません。

`index.html` には `noindex, nofollow` を設定しています。ただし、これは検索結果に出にくくするための設定であり、URLを知る第三者の閲覧を技術的に拒否する認証ではありません。
