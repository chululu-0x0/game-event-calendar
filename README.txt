# Pixel Frame v2

今回の修正では、`clip-path + border` 方式をやめて、
外枠を「濃い色のピクセル形の背景」として描画し、その上に
少し小さい内側の面を重ねる方式に変更しています。

## 差し替えるファイル

- `pixel-corners.css`

GitHub 上の既存 `pixel-corners.css` を、このファイルで丸ごと上書きしてください。

`index.html` はすでに

```html
<link rel="stylesheet" href="pixel-corners.css" />
```

を読み込んでいるため、今回は変更不要です。

## 調整しやすい値

```css
--px-step: 5px;
--px-step-small: 4px;
--px-frame: 3px;
```

- `--px-step`: 大きい枠の1段ぶん
- `--px-step-small`: ボタンなど小さい枠の1段ぶん
- `--px-frame`: 外枠の太さ
