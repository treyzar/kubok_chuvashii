-- +goose Up
ALTER TABLE complaint_details ADD COLUMN address VARCHAR(500);

-- +goose Down
ALTER TABLE complaint_details DROP COLUMN address;
