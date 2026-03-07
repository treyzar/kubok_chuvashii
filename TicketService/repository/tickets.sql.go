




package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/pgvector/pgvector-go"
)

const addTagsToTicket = `-- name: AddTagsToTicket :execrows
INSERT INTO ticket_tags (ticket, tag)
SELECT
  $1,
  unnest($2::INTEGER[])
ON CONFLICT DO NOTHING
`

type AddTagsToTicketParams struct {
	Ticket uuid.UUID `json:"ticket"`
	Tags   []int32   `json:"tags"`
}

func (q *Queries) AddTagsToTicket(ctx context.Context, arg AddTagsToTicketParams) (int64, error) {
	result, err := q.db.Exec(ctx, addTagsToTicket, arg.Ticket, arg.Tags)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected(), nil
}

const countTickets = `-- name: CountTickets :one
SELECT COUNT(*) FROM tickets WHERE is_hidden = false AND is_deleted = false
`

func (q *Queries) CountTickets(ctx context.Context) (int64, error) {
	row := q.db.QueryRow(ctx, countTickets)
	var count int64
	err := row.Scan(&count)
	return count, err
}

const createComplaint = `-- name: CreateComplaint :one
INSERT INTO complaint_details (
  ticket,
  description,
  sender_name,
  sender_phone,
  sender_email,
  geo_location,
  address
) VALUES (
  $1, $2, $3, $4, $5, $6, $7
) RETURNING id, ticket, description, sender_name, sender_phone, sender_email, geo_location, address
`

type CreateComplaintParams struct {
	Ticket      uuid.UUID   `json:"ticket"`
	Description string      `json:"description"`
	SenderName  string      `json:"sender_name"`
	SenderPhone *string     `json:"sender_phone"`
	SenderEmail *string     `json:"sender_email"`
	GeoLocation interface{} `json:"geo_location"`
	Address     *string     `json:"address"`
}

func (q *Queries) CreateComplaint(ctx context.Context, arg CreateComplaintParams) (ComplaintDetail, error) {
	row := q.db.QueryRow(ctx, createComplaint,
		arg.Ticket,
		arg.Description,
		arg.SenderName,
		arg.SenderPhone,
		arg.SenderEmail,
		arg.GeoLocation,
		arg.Address,
	)
	var i ComplaintDetail
	err := row.Scan(
		&i.ID,
		&i.Ticket,
		&i.Description,
		&i.SenderName,
		&i.SenderPhone,
		&i.SenderEmail,
		&i.GeoLocation,
		&i.Address,
	)
	return i, err
}

const createTicketWithDefaults = `-- name: CreateTicketWithDefaults :one

INSERT INTO tickets (
    description,
    subcategory_id,
    department_id,
    embedding
) VALUES (
    $1,
    $2, 
    $3, 
    $4
) RETURNING id, status, description, subcategory_id, department_id, embedding, is_hidden, is_deleted, created_at
`

type CreateTicketWithDefaultsParams struct {
	Description   string           `json:"description"`
	SubcategoryID int32            `json:"subcategory_id"`
	DepartmentID  *int32           `json:"department_id"`
	Embedding     *pgvector.Vector `json:"embedding"`
}


func (q *Queries) CreateTicketWithDefaults(ctx context.Context, arg CreateTicketWithDefaultsParams) (Ticket, error) {
	row := q.db.QueryRow(ctx, createTicketWithDefaults,
		arg.Description,
		arg.SubcategoryID,
		arg.DepartmentID,
		arg.Embedding,
	)
	var i Ticket
	err := row.Scan(
		&i.ID,
		&i.Status,
		&i.Description,
		&i.SubcategoryID,
		&i.DepartmentID,
		&i.Embedding,
		&i.IsHidden,
		&i.IsDeleted,
		&i.CreatedAt,
	)
	return i, err
}

const deleteTagsFromTicket = `-- name: DeleteTagsFromTicket :execrows
DELETE FROM ticket_tags
WHERE ticket = $1 AND tag = ANY($2::INTEGER[])
`

type DeleteTagsFromTicketParams struct {
	Ticket uuid.UUID `json:"ticket"`
	Tags   []int32   `json:"tags"`
}

func (q *Queries) DeleteTagsFromTicket(ctx context.Context, arg DeleteTagsFromTicketParams) (int64, error) {
	result, err := q.db.Exec(ctx, deleteTagsFromTicket, arg.Ticket, arg.Tags)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected(), nil
}

const deleteTicket = `-- name: DeleteTicket :one
UPDATE tickets
SET is_deleted = true
WHERE id = $1
RETURNING id, status, description, subcategory_id, department_id, embedding, is_hidden, is_deleted, created_at
`

type DeleteTicketParams struct {
	ID uuid.UUID `json:"id"`
}

func (q *Queries) DeleteTicket(ctx context.Context, arg DeleteTicketParams) (Ticket, error) {
	row := q.db.QueryRow(ctx, deleteTicket, arg.ID)
	var i Ticket
	err := row.Scan(
		&i.ID,
		&i.Status,
		&i.Description,
		&i.SubcategoryID,
		&i.DepartmentID,
		&i.Embedding,
		&i.IsHidden,
		&i.IsDeleted,
		&i.CreatedAt,
	)
	return i, err
}

const getDetailsForTicket = `-- name: GetDetailsForTicket :many
SELECT
  cd.id,
  cd.description,
  cd.sender_name,
  cd.sender_phone,
  cd.sender_email,
  cd.address,
  ST_X(cd.geo_location::geometry) AS longitude,
  ST_Y(cd.geo_location::geometry) AS latitude
FROM complaint_details cd
INNER JOIN tickets t ON t.id = cd.ticket
WHERE cd.ticket = $1
  AND t.is_hidden = false
  AND t.is_deleted = false
`

type GetDetailsForTicketParams struct {
	Ticket uuid.UUID `json:"ticket"`
}

type GetDetailsForTicketRow struct {
	ID          uuid.UUID   `json:"id"`
	Description string      `json:"description"`
	SenderName  string      `json:"sender_name"`
	SenderPhone *string     `json:"sender_phone"`
	SenderEmail *string     `json:"sender_email"`
	Address     *string     `json:"address"`
	Longitude   interface{} `json:"longitude"`
	Latitude    interface{} `json:"latitude"`
}

func (q *Queries) GetDetailsForTicket(ctx context.Context, arg GetDetailsForTicketParams) ([]GetDetailsForTicketRow, error) {
	rows, err := q.db.Query(ctx, getDetailsForTicket, arg.Ticket)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []GetDetailsForTicketRow{}
	for rows.Next() {
		var i GetDetailsForTicketRow
		if err := rows.Scan(
			&i.ID,
			&i.Description,
			&i.SenderName,
			&i.SenderPhone,
			&i.SenderEmail,
			&i.Address,
			&i.Longitude,
			&i.Latitude,
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

const getTicket = `-- name: GetTicket :one
SELECT
  t.id,
  t.status,
  t.description,
  t.is_hidden,
  t.subcategory_id,
  t.department_id,
  t.created_at,
  c.name AS category_name,
  sc.name AS subcategory_name,
  d.name AS department_name,
  COALESCE(
    array_agg(tags.id) FILTER (WHERE tags.id IS NOT NULL),
    '{}'
  )::INTEGER[] AS tag_ids,
  COALESCE(
    array_agg(tags.name) FILTER (WHERE tags.name IS NOT NULL),
    '{}'
  )::VARCHAR[] AS tag_names
FROM tickets t
LEFT JOIN subcategories sc ON sc.id = t.subcategory_id
LEFT JOIN categories c ON c.id = sc.category_id
LEFT JOIN departments d ON d.id = t.department_id
LEFT JOIN ticket_tags ON ticket_tags.ticket = t.id
LEFT JOIN tags ON tags.id = ticket_tags.tag
WHERE t.id = $1 AND t.is_hidden = false AND t.is_deleted = false AND
  ($2::BOOLEAN OR ($3::INTEGER IS NOT NULL AND t.department_id = $3::INTEGER))
GROUP BY t.id, c.name, sc.name, d.name
`

type GetTicketParams struct {
	ID               uuid.UUID `json:"id"`
	IsAdmin          bool      `json:"is_admin"`
	DepartmentFilter *int32    `json:"department_filter"`
}

type GetTicketRow struct {
	ID              uuid.UUID    `json:"id"`
	Status          TicketStatus `json:"status"`
	Description     string       `json:"description"`
	IsHidden        bool         `json:"is_hidden"`
	SubcategoryID   int32        `json:"subcategory_id"`
	DepartmentID    *int32       `json:"department_id"`
	CreatedAt       time.Time    `json:"created_at"`
	CategoryName    *string      `json:"category_name"`
	SubcategoryName *string      `json:"subcategory_name"`
	DepartmentName  *string      `json:"department_name"`
	TagIds          []int32      `json:"tag_ids"`
	TagNames        []string     `json:"tag_names"`
}

func (q *Queries) GetTicket(ctx context.Context, arg GetTicketParams) (GetTicketRow, error) {
	row := q.db.QueryRow(ctx, getTicket, arg.ID, arg.IsAdmin, arg.DepartmentFilter)
	var i GetTicketRow
	err := row.Scan(
		&i.ID,
		&i.Status,
		&i.Description,
		&i.IsHidden,
		&i.SubcategoryID,
		&i.DepartmentID,
		&i.CreatedAt,
		&i.CategoryName,
		&i.SubcategoryName,
		&i.DepartmentName,
		&i.TagIds,
		&i.TagNames,
	)
	return i, err
}

const hideTicket = `-- name: HideTicket :one
UPDATE tickets
SET is_hidden = true
WHERE id = $1
RETURNING id, status, description, subcategory_id, department_id, embedding, is_hidden, is_deleted, created_at
`

type HideTicketParams struct {
	ID uuid.UUID `json:"id"`
}

func (q *Queries) HideTicket(ctx context.Context, arg HideTicketParams) (Ticket, error) {
	row := q.db.QueryRow(ctx, hideTicket, arg.ID)
	var i Ticket
	err := row.Scan(
		&i.ID,
		&i.Status,
		&i.Description,
		&i.SubcategoryID,
		&i.DepartmentID,
		&i.Embedding,
		&i.IsHidden,
		&i.IsDeleted,
		&i.CreatedAt,
	)
	return i, err
}

const listAllTickets = `-- name: ListAllTickets :many
SELECT id, status, description, subcategory_id, department_id, embedding, is_hidden, is_deleted, created_at FROM tickets WHERE is_deleted = false ORDER BY created_at DESC
`

func (q *Queries) ListAllTickets(ctx context.Context) ([]Ticket, error) {
	rows, err := q.db.Query(ctx, listAllTickets)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Ticket{}
	for rows.Next() {
		var i Ticket
		if err := rows.Scan(
			&i.ID,
			&i.Status,
			&i.Description,
			&i.SubcategoryID,
			&i.DepartmentID,
			&i.Embedding,
			&i.IsHidden,
			&i.IsDeleted,
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

const listTickets = `-- name: ListTickets :many
SELECT
  t.id,
  t.status,
  t.description,
  t.is_hidden,
  t.subcategory_id,
  t.department_id,
  t.created_at,
  c.name AS category_name,
  sc.name AS subcategory_name,
  d.name AS department_name,
  COALESCE(
    array_agg(tags.id) FILTER (WHERE tags.id IS NOT NULL),
    '{}'
  )::INTEGER[] AS tag_ids,
  COALESCE(
    array_agg(tags.name) FILTER (WHERE tags.name IS NOT NULL),
    '{}'
  )::VARCHAR[] AS tag_names,
  CASE 
    WHEN $1::vector IS NOT NULL THEN t.embedding <=> $1::vector
    ELSE NULL
  END AS similarity
FROM tickets t
LEFT JOIN subcategories sc ON sc.id = t.subcategory_id
LEFT JOIN categories c ON c.id = sc.category_id
LEFT JOIN departments d ON d.id = t.department_id
LEFT JOIN ticket_tags ON ticket_tags.ticket = t.id
LEFT JOIN tags ON tags.id = ticket_tags.tag
WHERE
  t.is_hidden = false AND t.is_deleted = false AND
  ($2::ticket_status IS NULL OR t.status = $2::ticket_status) AND
  ($3::INTEGER IS NULL OR t.subcategory_id = $3::INTEGER) AND
  ($4::BOOLEAN OR ($5::INTEGER IS NOT NULL AND t.department_id = $5::INTEGER))
GROUP BY t.id, c.name, sc.name, d.name
ORDER BY 
  CASE 
    WHEN $1::vector IS NULL THEN 0
    ELSE 1
  END,
  CASE 
    WHEN $1::vector IS NOT NULL THEN t.embedding <=> $1::vector
    ELSE NULL
  END,
  t.created_at DESC
LIMIT $7::INTEGER OFFSET $6::INTEGER
`

type ListTicketsParams struct {
	Embedding        *pgvector.Vector `json:"embedding"`
	Status           NullTicketStatus `json:"status"`
	Subcategory      *int32           `json:"subcategory"`
	IsAdmin          bool             `json:"is_admin"`
	DepartmentFilter *int32           `json:"department_filter"`
	Offset           int32            `json:"offset"`
	Limit            int32            `json:"limit"`
}

type ListTicketsRow struct {
	ID              uuid.UUID    `json:"id"`
	Status          TicketStatus `json:"status"`
	Description     string       `json:"description"`
	IsHidden        bool         `json:"is_hidden"`
	SubcategoryID   int32        `json:"subcategory_id"`
	DepartmentID    *int32       `json:"department_id"`
	CreatedAt       time.Time    `json:"created_at"`
	CategoryName    *string      `json:"category_name"`
	SubcategoryName *string      `json:"subcategory_name"`
	DepartmentName  *string      `json:"department_name"`
	TagIds          []int32      `json:"tag_ids"`
	TagNames        []string     `json:"tag_names"`
	Similarity      interface{}  `json:"similarity"`
}

func (q *Queries) ListTickets(ctx context.Context, arg ListTicketsParams) ([]ListTicketsRow, error) {
	rows, err := q.db.Query(ctx, listTickets,
		arg.Embedding,
		arg.Status,
		arg.Subcategory,
		arg.IsAdmin,
		arg.DepartmentFilter,
		arg.Offset,
		arg.Limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []ListTicketsRow{}
	for rows.Next() {
		var i ListTicketsRow
		if err := rows.Scan(
			&i.ID,
			&i.Status,
			&i.Description,
			&i.IsHidden,
			&i.SubcategoryID,
			&i.DepartmentID,
			&i.CreatedAt,
			&i.CategoryName,
			&i.SubcategoryName,
			&i.DepartmentName,
			&i.TagIds,
			&i.TagNames,
			&i.Similarity,
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

const updateTicketCreatedAt = `-- name: UpdateTicketCreatedAt :exec
UPDATE tickets SET created_at = $2 WHERE id = $1
`

type UpdateTicketCreatedAtParams struct {
	ID        uuid.UUID `json:"id"`
	CreatedAt time.Time `json:"created_at"`
}

func (q *Queries) UpdateTicketCreatedAt(ctx context.Context, arg UpdateTicketCreatedAtParams) error {
	_, err := q.db.Exec(ctx, updateTicketCreatedAt, arg.ID, arg.CreatedAt)
	return err
}

const updateTicketSimple = `-- name: UpdateTicketSimple :one
UPDATE tickets
SET
  status = coalesce($1::ticket_status, status),
  department_id = coalesce($2::INTEGER, department_id)
WHERE is_hidden = false AND is_deleted = false AND
  id = $3
RETURNING status, department_id
`

type UpdateTicketSimpleParams struct {
	Status       NullTicketStatus `json:"status"`
	DepartmentID *int32           `json:"department_id"`
	ID           uuid.UUID        `json:"id"`
}

type UpdateTicketSimpleRow struct {
	Status       TicketStatus `json:"status"`
	DepartmentID *int32       `json:"department_id"`
}

func (q *Queries) UpdateTicketSimple(ctx context.Context, arg UpdateTicketSimpleParams) (UpdateTicketSimpleRow, error) {
	row := q.db.QueryRow(ctx, updateTicketSimple, arg.Status, arg.DepartmentID, arg.ID)
	var i UpdateTicketSimpleRow
	err := row.Scan(&i.Status, &i.DepartmentID)
	return i, err
}

const getSimilarTickets = `-- name: GetSimilarTickets :many
SELECT
  t.id,
  t.status,
  t.description,
  t.subcategory_id,
  t.department_id,
  c.name AS category_name,
  sc.name AS subcategory_name,
  d.name AS department_name,
  (1 - (t.embedding <=> target.embedding))::FLOAT AS similarity_score
FROM tickets t
CROSS JOIN (SELECT embedding FROM tickets WHERE id = $1) AS target
LEFT JOIN subcategories sc ON sc.id = t.subcategory_id
LEFT JOIN categories c ON c.id = sc.category_id
LEFT JOIN departments d ON d.id = t.department_id
WHERE t.id != $1
  AND t.is_hidden = false 
  AND t.is_deleted = false
  AND t.embedding IS NOT NULL
  AND target.embedding IS NOT NULL
  AND t.status IN ('init', 'open')
  AND (1 - (t.embedding <=> target.embedding)) > 0.80
ORDER BY similarity_score DESC
LIMIT 5
`

type GetSimilarTicketsParams struct {
	TargetID uuid.UUID `json:"target_id"`
}

type GetSimilarTicketsRow struct {
	ID              uuid.UUID    `json:"id"`
	Status          TicketStatus `json:"status"`
	Description     string       `json:"description"`
	SubcategoryID   int32        `json:"subcategory_id"`
	DepartmentID    *int32       `json:"department_id"`
	CategoryName    *string      `json:"category_name"`
	SubcategoryName *string      `json:"subcategory_name"`
	DepartmentName  *string      `json:"department_name"`
	SimilarityScore float64      `json:"similarity_score"`
}

func (q *Queries) GetSimilarTickets(ctx context.Context, arg GetSimilarTicketsParams) ([]GetSimilarTicketsRow, error) {
	rows, err := q.db.Query(ctx, getSimilarTickets, arg.TargetID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetSimilarTicketsRow
	for rows.Next() {
		var i GetSimilarTicketsRow
		if err := rows.Scan(
			&i.ID,
			&i.Status,
			&i.Description,
			&i.SubcategoryID,
			&i.DepartmentID,
			&i.CategoryName,
			&i.SubcategoryName,
			&i.DepartmentName,
			&i.SimilarityScore,
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
