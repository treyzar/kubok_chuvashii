




package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

const getCategoryStatistics = `-- name: GetCategoryStatistics :many
SELECT 
    c.id,
    c.name,
    COUNT(t.id) as ticket_count
FROM categories c
LEFT JOIN subcategories sc ON sc.category_id = c.id
LEFT JOIN tickets t ON t.subcategory_id = sc.id 
    AND t.is_deleted = false 
    AND t.is_hidden = false
GROUP BY c.id, c.name
ORDER BY ticket_count DESC, c.name
`

type GetCategoryStatisticsRow struct {
	ID          int32  `json:"id"`
	Name        string `json:"name"`
	TicketCount int64  `json:"ticket_count"`
}

func (q *Queries) GetCategoryStatistics(ctx context.Context) ([]GetCategoryStatisticsRow, error) {
	rows, err := q.db.Query(ctx, getCategoryStatistics)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []GetCategoryStatisticsRow{}
	for rows.Next() {
		var i GetCategoryStatisticsRow
		if err := rows.Scan(&i.ID, &i.Name, &i.TicketCount); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getStatisticsSummary = `-- name: GetStatisticsSummary :one
SELECT
    COUNT(*) FILTER (WHERE is_deleted = false AND is_hidden = false) AS total,

    COUNT(*) FILTER (
        WHERE status = 'closed'
        AND is_deleted = false
        AND is_hidden = false
    ) AS resolved,

    COUNT(*) FILTER (
        WHERE status = 'open'
        AND is_deleted = false
        AND is_hidden = false
    ) AS in_progress,

    COUNT(DISTINCT department_id) FILTER (
        WHERE department_id IS NOT NULL
        AND is_deleted = false
        AND is_hidden = false
    ) AS active_executors
FROM tickets
`

type GetStatisticsSummaryRow struct {
	Total           int64 `json:"total"`
	Resolved        int64 `json:"resolved"`
	InProgress      int64 `json:"in_progress"`
	ActiveExecutors int64 `json:"active_executors"`
}

func (q *Queries) GetStatisticsSummary(ctx context.Context) (GetStatisticsSummaryRow, error) {
	row := q.db.QueryRow(ctx, getStatisticsSummary)
	var i GetStatisticsSummaryRow
	err := row.Scan(
		&i.Total,
		&i.Resolved,
		&i.InProgress,
		&i.ActiveExecutors,
	)
	return i, err
}

const getTicketDynamics = `-- name: GetTicketDynamics :many
SELECT
    d.date,
    COALESCE(t.received, 0) AS received,
    COALESCE(h.resolved, 0) AS resolved
FROM (
    SELECT generate_series(
        DATE($1::DATE),
        DATE($2::DATE),
        '1 day'::interval
    )::DATE AS date
) d
LEFT JOIN (
    SELECT
        DATE(created_at) AS date,
        COUNT(*) AS received
    FROM tickets
    WHERE
        is_deleted = false
        AND DATE(created_at) >= DATE($1::DATE)
        AND DATE(created_at) <= DATE($2::DATE)
    GROUP BY DATE(created_at)
) t ON t.date = d.date
LEFT JOIN (
    SELECT
        DATE(created_at) AS date,
        COUNT(*) AS resolved
    FROM ticket_history
    WHERE
        action = 'status_changed'
        AND new_value::jsonb->>'status' = 'closed'
        AND DATE(created_at) >= DATE($1::DATE)
        AND DATE(created_at) <= DATE($2::DATE)
    GROUP BY DATE(created_at)
) h ON h.date = d.date
ORDER BY d.date ASC
`

type GetTicketDynamicsParams struct {
	StartDate pgtype.Date `json:"start_date"`
	EndDate   pgtype.Date `json:"end_date"`
}

type GetTicketDynamicsRow struct {
	Date     pgtype.Date `json:"date"`
	Received int64       `json:"received"`
	Resolved int64       `json:"resolved"`
}

func (q *Queries) GetTicketDynamics(ctx context.Context, arg GetTicketDynamicsParams) ([]GetTicketDynamicsRow, error) {
	rows, err := q.db.Query(ctx, getTicketDynamics, arg.StartDate, arg.EndDate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []GetTicketDynamicsRow{}
	for rows.Next() {
		var i GetTicketDynamicsRow
		if err := rows.Scan(&i.Date, &i.Received, &i.Resolved); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getTicketDynamicsByWeek = `-- name: GetTicketDynamicsByWeek :many
SELECT
    DATE_TRUNC('week', d.week_start)::DATE AS week_start,
    COALESCE(t.received, 0) AS received,
    COALESCE(h.resolved, 0) AS resolved
FROM (
    SELECT generate_series(
        DATE_TRUNC('week', $1::DATE),
        DATE_TRUNC('week', $2::DATE),
        '1 week'::interval
    )::DATE AS week_start
) d
LEFT JOIN (
    SELECT
        DATE_TRUNC('week', created_at)::DATE AS week_start,
        COUNT(*) AS received
    FROM tickets
    WHERE
        is_deleted = false
        AND created_at >= $1::DATE
        AND created_at < ($2::DATE + INTERVAL '1 day')
    GROUP BY DATE_TRUNC('week', created_at)
) t ON t.week_start = d.week_start
LEFT JOIN (
    SELECT
        DATE_TRUNC('week', created_at)::DATE AS week_start,
        COUNT(*) AS resolved
    FROM ticket_history
    WHERE
        action = 'status_changed'
        AND new_value::jsonb->>'status' = 'closed'
        AND created_at >= $1::DATE
        AND created_at < ($2::DATE + INTERVAL '1 day')
    GROUP BY DATE_TRUNC('week', created_at)
) h ON h.week_start = d.week_start
ORDER BY d.week_start ASC
`

type GetTicketDynamicsByWeekParams struct {
	StartDate pgtype.Date `json:"start_date"`
	EndDate   pgtype.Date `json:"end_date"`
}

type GetTicketDynamicsByWeekRow struct {
	WeekStart pgtype.Date `json:"week_start"`
	Received  int64       `json:"received"`
	Resolved  int64       `json:"resolved"`
}

func (q *Queries) GetTicketDynamicsByWeek(ctx context.Context, arg GetTicketDynamicsByWeekParams) ([]GetTicketDynamicsByWeekRow, error) {
	rows, err := q.db.Query(ctx, getTicketDynamicsByWeek, arg.StartDate, arg.EndDate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []GetTicketDynamicsByWeekRow{}
	for rows.Next() {
		var i GetTicketDynamicsByWeekRow
		if err := rows.Scan(&i.WeekStart, &i.Received, &i.Resolved); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
