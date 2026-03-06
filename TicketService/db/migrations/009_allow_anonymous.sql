-- +goose Up
ALTER TABLE complaint_details DROP CONSTRAINT chk_at_least_one_contact;

-- +goose Down
ALTER TABLE complaint_details ADD CONSTRAINT chk_at_least_one_contact CHECK (
    sender_phone IS NOT NULL OR 
    sender_email IS NOT NULL
);
