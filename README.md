# CSV Quiz App

CSVファイルをアップロードして、自分だけのクイズを作成・学習できるモダンなWebアプリケーションです。
Next.js（App Router）とSupabaseをベースに、美しく使いやすいUI/UXを提供します。

## 🚀 主な機能

-   **クイズ学習モード**:
    -   「通常クイズ」: 全問題から指定した問題数をランダムに出題。
    -   「ニガテ克服クイズ」: 過去の正答率に基づいて、間違えやすい問題を優先的に出題。
-   **直感的な問題管理**:
    -   1問ずつの個別作成、編集、削除機能。
    -   チェックボックスによる一括選択・一括削除。
-   **CSVインポート/エクスポート**:
    -   Papaparseを利用した高速な一括登録。
    -   登録済みデータの一括バックアップ（Excel対応のBOM付UTF-8形式）。
-   **学習状況の可視化**:
    -   ダッシュボードでの学習状況、正答率、総正解数の表示。
    -   各問題ごとの最新回答結果のバッジ表示。
-   **リファレンスリンク検証**:
    -   問題に設定した参考URLが切れていないかを自動でチェック。
    -   リンク切れ問題を一目で特定可能。

## 🛠 技術スタック

-   **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
-   **UI Components**: shadcn/ui, base-ui, Lucide React (Icons)
-   **Backend/Database**: Supabase (Auth, Database, SSR)
-   **Form/Validation**: React Hook Form, Zod
-   **Tools**: Papaparse (CSV), Sonner (Toasts)

## 📦 セットアップ

### 1. インストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、Supabaseのプロジェクト情報を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase テーブル作成SQL

SupabaseのSQL Editorで以下のSQLを実行してテーブルを作成してください。

```sql
-- 1. questions テーブル
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  answer TEXT NOT NULL, -- 'A', 'B', 'C', 'D'
  explain TEXT NOT NULL,
  reference_url TEXT,
  is_link_broken BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, question)
);

-- 2. quiz_results テーブル
CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT now()
);

-- 3. link_check_history テーブル
CREATE TABLE public.link_check_history (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (Row Level Security) の有効化を推奨
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_check_history ENABLE ROW LEVEL SECURITY;
```

### 4. 実行

```bash
npm run dev
```

`http://localhost:3000` にアクセスして、サインアップ/ログイン後に利用を開始してください。

## 📝 補足

-   **1日の登録制限**: デフォルトで1日200件までの登録制限が設けられています（`actions.ts` 内で制御）。
-   **CSV形式**: ヘッダー（question, option_a, option_b, option_c, option_d, answer, explain, reference_url）を含むCSVファイルをサポートしています。
-   **リンクチェック**: サーバー負荷とレートリミットを考慮し、24時間に1回のみ実行可能です。

## 📜 ライセンス

MIT
