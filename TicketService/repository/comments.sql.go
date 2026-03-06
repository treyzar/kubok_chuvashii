




package repository

import (
	"context"

	"github.com/google/uuid"
)

const createComment = `-- name: CreateComment :one
INSERT INTO comments (
    ticket,
    message,
    user_name
) VALUES (
    $1, $2, $3
) RETURNING id, ticket, message, user_name, created_at
`

type CreateCommentParams struct {
	Ticket   uuid.UUID `json:"ticket"`
	Message  string    `json:"message"`
	UserName *string   `json:"user_name"`
}

func (q *Queries) CreateComment(ctx context.Context, arg CreateCommentParams) (Comment, error) {
	row := q.db.QueryRow(ctx, createComment, arg.Ticket, arg.Message, arg.UserName)
	var i Comment
	err := row.Scan(
		&i.ID,
		&i.Ticket,
		&i.Message,
		&i.UserName,
		&i.CreatedAt,
	)
	return i, err
}

const deleteComment = `-- name: DeleteComment :exec
DELETE FROM comments WHERE id = $1
`

type DeleteCommentParams struct {
	ID uuid.UUID `json:"id"`
}

func (q *Queries) DeleteComment(ctx context.Context, arg DeleteCommentParams) error {
	_, err := q.db.Exec(ctx, deleteComment, arg.ID)
	return err
}

const getCommentsForTicket = `-- name: GetCommentsForTicket :many
SELECT
    id,
    ticket,
    message,
    user_name,
    created_at
FROM comments
WHERE ticket = $1
ORDER BY created_at ASC
`

type GetCommentsForTicketParams struct {
	Ticket uuid.UUID `json:"ticket"`
}

func (q *Queries) GetCommentsForTicket(ctx context.Context, arg GetCommentsForTicketParams) ([]Comment, error) {
	rows, err := q.db.Query(ctx, getCommentsForTicket, arg.Ticket)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Comment{}
	for rows.Next() {
		var i Comment
		if err := rows.Scan(
			&i.ID,
			&i.Ticket,
			&i.Message,
			&i.UserName,
			&i.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
