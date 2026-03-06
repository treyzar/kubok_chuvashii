-- name: CreateComment :one
INSERT INTO comments (
    ticket,
    message,
    user_name
) VALUES (
    $1, $2, $3
) RETURNING *;

-- name: GetCommentsForTicket :many
SELECT
    id,
    ticket,
    message,
    user_name,
    created_at
FROM comments
WHERE ticket = $1
ORDER BY created_at ASC;

-- name: DeleteComment :exec
DELETE FROM comments WHERE id = $1;
