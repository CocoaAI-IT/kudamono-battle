# 画面遷移・メニュー設計

Kudamono Battle の画面構成は次の通りです。

```text
Title -> Character Select -> Stage Select -> Game -> Result
```

## Title

タイトル画面は `public/assets/ui/title-key-art.webp` を背景に使い、ゲーム名と `START` ボタンを表示します。

- `START` / `Enter`: キャラクター選択へ進む

## Character Select

キャラクター選択画面はカード型UIです。初期ロスター6体を2行3列で表示し、今後キャラクターが増えても `CHARACTER_SELECT_CARDS` の配列からカードを生成できます。

表示内容:

- ポートレート
- キャラクター名
- 役割
- 特性
- 武器
- 選択中マーカー

操作:

- `Left` / `Right`: 横移動
- `Up` / `Down`: 行移動
- `Enter`: ステージ選択へ進む
- `Esc`: タイトルへ戻る

CPUキャラクターは、プレイヤーが選んだキャラに対して相性が出やすいライバルを自動選択します。

## Stage Select

ステージ選択画面はカード型UIです。現在は2ステージを選択できます。

| ステージ | 構造 | 画像 |
| --- | --- | --- |
| Kitchen Counter | 大きなまな板 + 左右の皿小足場 | `public/assets/kitchen-stage.webp` |
| Dark Board | 終点風の暗いまな板1枚のみ | `public/assets/dark-board-stage.jpg` |

`Dark Board` はスマブラの終点のように、浮いている小足場を持たないシンプルな横長ステージです。床判定は暗いまな板の上面に合わせています。

操作:

- `Left` / `Right`: ステージ選択
- `Enter`: 対戦開始
- `Esc`: キャラクター選択へ戻る

## Game

対戦画面では、選択したキャラクターとCPUが3ストック制で戦います。

PC操作:

- `A` / `D`: 移動
- `W`: ジャンプ / 上入力
- `S`: 下入力
- `J`: 通常攻撃
- `K`: 必殺技
- `L`: 回避
- `R`: リスタート

スマホ操作:

- 左スティック: 移動と方向入力
- `A`: 通常攻撃
- `B`: 必殺技

上方向にスティックを倒すとジャンプ扱いになります。PCではタッチ操作UIを表示しません。

## Result

試合終了後は結果画面へ遷移します。

- `REMATCH` / `R`: 同じ条件で再戦
- `CHARACTER SELECT` / `C`: キャラクター選択へ戻る
- `TITLE` / `T`: タイトルへ戻る

`ResultScene` には `MatchConfig` を渡しているため、再戦やキャラクター選択への復帰時に、直前の選択状態を維持できます。
