-- درخواست افزودن برنامه — فرم «درخواست اپ» (کاربر لاگین‌کرده)
CREATE TABLE IF NOT EXISTS app_requests (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_name varchar(255) NOT NULL,
  source_link text,
  platform varchar(16) NOT NULL DEFAULT 'android',
  note text,
  status varchar(32) NOT NULL DEFAULT 'pending',
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS app_requests_user_idx ON app_requests (user_id, created_at);
CREATE INDEX IF NOT EXISTS app_requests_status_idx ON app_requests (status, created_at);
