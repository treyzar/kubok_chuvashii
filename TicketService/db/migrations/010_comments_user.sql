-- +goose Up
ALTER TABLE comments ADD COLUMN user_name VARCHAR(255);
ALTER TABLE comments ADD COLUMN created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- +goose Down
ALTER TABLE comments drop column user_name;
ALTER TABLE comments drop column created_at;
