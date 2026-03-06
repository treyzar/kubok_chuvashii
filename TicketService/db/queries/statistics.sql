-- name: GetStatisticsSummary :one
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
FROM tickets;

-- name: GetCategoryStatistics :many
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
ORDER BY ticket_count DESC, c.name;

-- name: GetTicketDynamics :many
SELECT
    d.date,
    COALESCE(t.received, 0) AS received,
    COALESCE(h.resolved, 0) AS resolved
FROM (
    SELECT generate_series(
        DATE(sqlc.arg('start_date')::DATE),
        DATE(sqlc.arg('end_date')::DATE),
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
        AND DATE(created_at) >= DATE(sqlc.arg('start_date')::DATE)
        AND DATE(created_at) <= DATE(sqlc.arg('end_date')::DATE)
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
        AND DATE(created_at) >= DATE(sqlc.arg('start_date')::DATE)
        AND DATE(created_at) <= DATE(sqlc.arg('end_date')::DATE)
    GROUP BY DATE(created_at)
) h ON h.date = d.date
ORDER BY d.date ASC;

-- name: GetTicketDynamicsByWeek :many
SELECT
    DATE_TRUNC('week', d.week_start)::DATE AS week_start,
    COALESCE(t.received, 0) AS received,
    COALESCE(h.resolved, 0) AS resolved
FROM (
    SELECT generate_series(
        DATE_TRUNC('week', sqlc.arg('start_date')::DATE),
        DATE_TRUNC('week', sqlc.arg('end_date')::DATE),
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
        AND created_at >= sqlc.arg('start_date')::DATE
        AND created_at < (sqlc.arg('end_date')::DATE + INTERVAL '1 day')
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
        AND created_at >= sqlc.arg('start_date')::DATE
        AND created_at < (sqlc.arg('end_date')::DATE + INTERVAL '1 day')
    GROUP BY DATE_TRUNC('week', created_at)
) h ON h.week_start = d.week_start
ORDER BY d.week_start ASC;
