---
trigger: always_on
---

## プロジェクト設定

### 技術スタック

* フロントエンド：Next.js（App Router）+ TypeScript
* スタイリング：Tailwind CSS + shadcn/ui
* バックエンド：Supabase（Auth / Database / Storage）
* ORM：Prisma
* バリデーション：Zod
* フォーム管理：React Hook Form
* テスト：Vitest

---

## 出力要件

以下を必ずすべて出力すること：

* ディレクトリ構成
* 各ファイルのコード（省略しない）
* Supabaseのテーブル作成SQL
* 環境変数の説明
* セットアップ手順

---

## アーキテクチャ方針

### データ取得

* Server Componentsを基本とする
* クライアントでのデータ取得は最小限にする
* SupabaseクライアントまたはServer Actionsを使用する
* 不要なAPI Routesは作成しない

### コンポーネント設計

* UIとビジネスロジックを分離する
* 再利用可能なコンポーネントを作成する
* components/uiに共通UIを配置
* Server Component / Client Componentを適切に使い分ける

### ディレクトリ構成ルール

* app/：ルーティング
* components/：共通UI
* features/：機能単位のロジック
* lib/：ユーティリティ・設定
* types/：型定義

---

## 認証・認可

* Supabase Auth（Email + Password）を使用
* セッション管理はSupabaseの公式クライアントを使用
* middlewareでログイン状態を判定
* 未ログインユーザーはログインページへリダイレクト
* 認証が必要なページは保護する

---

## データベース設計

* 命名規則はsnake_case
* 主キーはUUIDを使用
* 全テーブルに以下を含める：
  * created_at
  * updated_at
* 外部キー制約を適切に設定
* 必要に応じて論理削除（deleted_at）を使用

---

## フォーム仕様

* React Hook Form + Zodを使用
* リアルタイムバリデーションを行う
* エラーは項目の下に赤字で表示
* フォーカス時にスタイル変更
* サーバー側バリデーションも実装する

---

## UI要件

* モダンでクリーンなデザイン
* レスポンシブ対応
* shadcn/uiベースで構築
* 日本語で統一する
* ローディング状態を適切に表示
* 空データ時のUIも用意する


---

## エラーハンドリング

* try-catchで適切に処理する
* ユーザー向けメッセージと開発者向けログを分離
* フォームエラーはフィールド単位で表示
* 予期しないエラーは共通UIまたはトーストで表示

---

## 環境変数

* NEXT_PUBLIC_とサーバー専用変数を明確に分離
* 秘密情報はクライアントに渡さない

---

## テスト

* Vitestを使用
* ユーティリティ関数の単体テストを作成
* バリデーションのテストを作成
* 正常系・異常系を網羅する

---

## セキュリティ

* Supabaseのクエリを使用しSQLインジェクションを防ぐ
* XSS対策を行う（dangerouslySetInnerHTMLは極力使用しない）
* 認証・認可を必ずサーバー側でも検証する

---

## パフォーマンス

* 不要な再レンダリングを防ぐ
* キャッシュを適切に利用する
* Server Componentsを活用する

---

## 補足

* 実務で動くレベルの品質で実装すること
* ダミーデータは禁止（必ずDBと接続する）
* 可読性・保守性を重視する
* 型安全を担保する（TypeScriptを厳密に使用）
* コメントは必要最小限にする（冗長にしない）
* Implementation Plan, Task, Walkthroughの内容はすべて日本語で表記すること

---