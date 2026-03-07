package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/SomeSuperCoder/OnlineShop/internal"
	"github.com/SomeSuperCoder/OnlineShop/internal/embeddings"
	"github.com/SomeSuperCoder/OnlineShop/repository"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pgvector/pgvector-go"
)

type TicketHandler struct {
	Repo *repository.Queries
	Pool *pgxpool.Pool
}



type PostTicketRequest struct {
	Body struct {
		Description   string  `json:"description"`
		SenderName    string  `json:"sender_name"`
		SenderPhone   *string `json:"sender_phone,omitempty"`
		SenderEmail   *string `json:"sender_email,omitempty"`
		Longitude     float64 `json:"longitude"`
		Latitude      float64 `json:"latitude"`
		SubcategoryID int32   `json:"subcategory_id"`
		DepartmentID  *int32  `json:"department_id,omitempty"`
	}
}

type PostTicketResponse struct {
	Body struct {
		Ticket           repository.Ticket          `json:"ticket"`
		ComplaintDetails repository.ComplaintDetail `json:"complaint_details"`
	}
}

func (h *TicketHandler) Post(ctx context.Context, req *PostTicketRequest) (*PostTicketResponse, error) {
	resp := new(PostTicketResponse)

	tx, err := h.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	qtx := h.Repo.WithTx(tx)

	// Extract address from description and clean the description
	var address *string
	cleanDescription := req.Body.Description
	if idx := strings.Index(req.Body.Description, "\n\nАдрес: "); idx != -1 {
		addressStr := req.Body.Description[idx+10:]
		address = &addressStr
		// Remove address from description for embedding
		cleanDescription = req.Body.Description[:idx]
	}

	// Generate embedding from CLEAN description (without address)
	vector, err := embeddings.GetEmbedding(cleanDescription)
	if err != nil {
		return nil, err
	}

	// Prepare geo location
	geoLocation := fmt.Sprintf("POINT(%f %f)", req.Body.Longitude, req.Body.Latitude)

	result, err := qtx.CreateTicketWithDefaults(ctx, repository.CreateTicketWithDefaultsParams{
		Description:   cleanDescription, // Use clean description without address
		SubcategoryID: req.Body.SubcategoryID,
		DepartmentID:  req.Body.DepartmentID,
		Embedding:     vector,
	})
	if err != nil {
		return nil, err
	}
	details, err := qtx.CreateComplaint(ctx, repository.CreateComplaintParams{
		Ticket:      result.ID,
		Description: req.Body.Description, // Keep full description with address in details
		SenderName:  req.Body.SenderName,
		SenderPhone: req.Body.SenderPhone,
		SenderEmail: req.Body.SenderEmail,
		GeoLocation: geoLocation,
		Address:     address,
	})
	if err != nil {
		return nil, err
	}

	resp.Body.Ticket = result
	resp.Body.ComplaintDetails = details

	// Create history entry
	newValue, _ := json.Marshal(map[string]interface{}{
		"status":         result.Status,
		"subcategory_id": result.SubcategoryID,
		"department_id":  result.DepartmentID,
	})
	_, err = qtx.CreateHistoryEntry(ctx, repository.CreateHistoryEntryParams{
		TicketID: result.ID,
		Action:   repository.HistoryActionCreated,
		NewValue: newValue,
	})
	if err != nil {
		return nil, err
	}

	tx.Commit(ctx)

	return resp, nil
}



type GetTicketRequest struct {
	ID uuid.UUID `path:"id"`
}

type GetTicketResponse struct {
	Body struct {
		Ticket  repository.GetTicketRow             `json:"ticket"`
		Details []repository.GetDetailsForTicketRow `json:"details"`
	}
}

func (h *TicketHandler) Get(ctx context.Context, req *GetTicketRequest) (*GetTicketResponse, error) {
	resp := new(GetTicketResponse)

	tx, err := h.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	qtx := h.Repo.WithTx(tx)

	
	deptFilter := internal.DepartmentFilter(ctx)

	result, err := qtx.GetTicket(ctx, repository.GetTicketParams{
		ID:               req.ID,
		IsAdmin:          internal.IsAdmin(ctx),
		DepartmentFilter: deptFilter,
	})
	if err != nil {
		return nil, err
	}

	details, err := qtx.GetDetailsForTicket(ctx, repository.GetDetailsForTicketParams{
		Ticket: req.ID,
	})
	if err != nil {
		return nil, err
	}

	resp.Body.Ticket = result
	resp.Body.Details = details

	tx.Commit(ctx)

	return resp, nil
}


type ListTicketsRequest struct {
	Query         string                  `query:"query"`
	Limit         int32                   `query:"limit" default:"10" maximum:"100"`
	Offset        int32                   `query:"offset" default:"0"`
	Status        repository.TicketStatus `query:"status_id"`
	SubcategoryID int32                   `query:"subcategory_id"`
}

type ListTicketsResponse struct {
	Body struct {
		Tickets []repository.ListTicketsRow `json:"tickets"`
		Total   int64                       `json:"total"`
	}
}

func (h *TicketHandler) List(ctx context.Context, req *ListTicketsRequest) (*ListTicketsResponse, error) {
	resp := new(ListTicketsResponse)

	
	var vector *pgvector.Vector
	if req.Query != "" {
		v, err := embeddings.GetEmbedding(req.Query)
		if err != nil {
			return nil, err
		}
		vector = v
	}

	
	var statusValid bool = false
	switch req.Status {
	case repository.TicketStatusInit, repository.TicketStatusOpen, repository.TicketStatusClosed:
		statusValid = true
	}
	var subcategoryID *int32
	if req.SubcategoryID != 0 {
		subcategoryID = &req.SubcategoryID
	}

	
	deptFilter := internal.DepartmentFilter(ctx)

	tickets, err := h.Repo.ListTickets(ctx, repository.ListTicketsParams{
		Limit:  req.Limit,
		Offset: req.Offset,
		Status: repository.NullTicketStatus{
			TicketStatus: req.Status,
			Valid:        statusValid,
		},
		Subcategory:      subcategoryID,
		Embedding:        vector,
		IsAdmin:          internal.IsAdmin(ctx),
		DepartmentFilter: deptFilter,
	})
	if err != nil {
		return nil, err
	}

	total, err := h.Repo.CountTickets(ctx)
	if err != nil {
		return nil, err
	}

	resp.Body.Tickets = tickets
	resp.Body.Total = total
	return resp, nil
}


type UpdateTicketRequest struct {
	TicketID uuid.UUID `path:"id"`
	Body     struct {
		Status       *repository.TicketStatus `json:"status,omitempty"`
		DepartmentID *int32                   `json:"department_id,omitempty"`
		AddTags      []int32                  `json:"add_tags,omitempty"`
		RemoveTags   []int32                  `json:"remove_tags,omitempty"`
	}
}
type UpdateTicketResponse struct {
	Body repository.UpdateTicketSimpleRow
}

func (h *TicketHandler) Update(ctx context.Context, req *UpdateTicketRequest) (*UpdateTicketResponse, error) {
	resp := new(UpdateTicketResponse)

	tx, err := h.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	qtx := h.Repo.WithTx(tx)

	// Get current ticket with access control
	deptFilter := internal.DepartmentFilter(ctx)
	currentTicket, err := qtx.GetTicket(ctx, repository.GetTicketParams{
		ID:               req.TicketID,
		IsAdmin:          internal.IsAdmin(ctx),
		DepartmentFilter: deptFilter,
	})
	if err != nil {
		return nil, err
	}

	// Prepare status update
	var status repository.NullTicketStatus
	if req.Body.Status != nil {
		status.Valid = true
		status.TicketStatus = *req.Body.Status
	}

	// Update ticket
	updateResult, err := qtx.UpdateTicketSimple(ctx, repository.UpdateTicketSimpleParams{
		ID:           req.TicketID,
		Status:       status,
		DepartmentID: req.Body.DepartmentID,
	})
	if err != nil {
		return nil, err
	}
	resp.Body = updateResult

	
	if req.Body.Status != nil && *req.Body.Status != currentTicket.Status {
		oldValue, _ := json.Marshal(map[string]interface{}{"status": currentTicket.Status})
		newValue, _ := json.Marshal(map[string]interface{}{"status": *req.Body.Status})
		_, err = qtx.CreateHistoryEntry(ctx, repository.CreateHistoryEntryParams{
			TicketID: req.TicketID,
			Action:   repository.HistoryActionStatusChanged,
			OldValue: oldValue,
			NewValue: newValue,
		})
		if err != nil {
			return nil, err
		}
	}

	
	if req.Body.DepartmentID != nil && (currentTicket.DepartmentID == nil || *req.Body.DepartmentID != *currentTicket.DepartmentID) {
		oldValue, _ := json.Marshal(map[string]interface{}{"department_id": currentTicket.DepartmentID})
		newValue, _ := json.Marshal(map[string]interface{}{"department_id": req.Body.DepartmentID})
		_, err = qtx.CreateHistoryEntry(ctx, repository.CreateHistoryEntryParams{
			TicketID: req.TicketID,
			Action:   repository.HistoryActionDepartmentChanged,
			OldValue: oldValue,
			NewValue: newValue,
		})
		if err != nil {
			return nil, err
		}
	}

	
	if len(req.Body.AddTags) > 0 {
		_, err = qtx.AddTagsToTicket(ctx, repository.AddTagsToTicketParams{
			Ticket: req.TicketID,
			Tags:   req.Body.AddTags,
		})
		if err != nil {
			return nil, err
		}

		
		newValue, _ := json.Marshal(map[string]interface{}{"tags": req.Body.AddTags})
		_, err = qtx.CreateHistoryEntry(ctx, repository.CreateHistoryEntryParams{
			TicketID: req.TicketID,
			Action:   repository.HistoryActionTagsAdded,
			NewValue: newValue,
		})
		if err != nil {
			return nil, err
		}
	}

	
	if len(req.Body.RemoveTags) > 0 {
		_, err = qtx.DeleteTagsFromTicket(ctx, repository.DeleteTagsFromTicketParams{
			Ticket: req.TicketID,
			Tags:   req.Body.RemoveTags,
		})
		if err != nil {
			return nil, err
		}

		
		oldValue, _ := json.Marshal(map[string]interface{}{"tags": req.Body.RemoveTags})
		_, err = qtx.CreateHistoryEntry(ctx, repository.CreateHistoryEntryParams{
			TicketID: req.TicketID,
			Action:   repository.HistoryActionTagsRemoved,
			OldValue: oldValue,
		})
		if err != nil {
			return nil, err
		}
	}

	tx.Commit(ctx)

	return resp, nil
}


type DeleteTicketRequest struct {
	ID uuid.UUID `path:"id"`
}

type DeleteTicketResponse struct {
	Body repository.Ticket
}

func (h *TicketHandler) Delete(ctx context.Context, req *DeleteTicketRequest) (*DeleteTicketResponse, error) {
	resp := new(DeleteTicketResponse)

	tx, err := h.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	qtx := h.Repo.WithTx(tx)

	ticket, err := qtx.DeleteTicket(ctx, repository.DeleteTicketParams{
		ID: req.ID,
	})
	if err != nil {
		return nil, err
	}

	
	oldValue, _ := json.Marshal(map[string]interface{}{
		"status":         ticket.Status,
		"is_deleted":     false,
		"subcategory_id": ticket.SubcategoryID,
	})
	newValue, _ := json.Marshal(map[string]interface{}{"is_deleted": true})
	_, err = qtx.CreateHistoryEntry(ctx, repository.CreateHistoryEntryParams{
		TicketID: req.ID,
		Action:   repository.HistoryActionDeleted,
		OldValue: oldValue,
		NewValue: newValue,
	})
	if err != nil {
		return nil, err
	}

	resp.Body = ticket

	tx.Commit(ctx)

	return resp, nil
}


type HideTicketRequest struct {
	ID uuid.UUID `path:"id"`
}

type HideTicketResponse struct {
	Body repository.Ticket
}

func (h *TicketHandler) Hide(ctx context.Context, req *HideTicketRequest) (*HideTicketResponse, error) {
	resp := new(HideTicketResponse)

	tx, err := h.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	qtx := h.Repo.WithTx(tx)

	ticket, err := qtx.HideTicket(ctx, repository.HideTicketParams{
		ID: req.ID,
	})
	if err != nil {
		return nil, err
	}

	
	oldValue, _ := json.Marshal(map[string]interface{}{
		"status":         ticket.Status,
		"is_hidden":      false,
		"subcategory_id": ticket.SubcategoryID,
	})
	newValue, _ := json.Marshal(map[string]interface{}{"is_hidden": true})
	_, err = qtx.CreateHistoryEntry(ctx, repository.CreateHistoryEntryParams{
		TicketID: req.ID,
		Action:   repository.HistoryActionDeleted, 
		OldValue: oldValue,
		NewValue: newValue,
	})
	if err != nil {
		return nil, err
	}

	resp.Body = ticket

	tx.Commit(ctx)

	return resp, nil
}


type MergeRequest struct {
	Body struct {
		Original   uuid.UUID   `json:"original"`
		Duplicates []uuid.UUID `json:"duplicates"`
	}
}
type MergeResonse struct {
}

func (h *TicketHandler) Merge(ctx context.Context, req *MergeRequest) (*MergeResonse, error) {
	resp := new(MergeResonse)

	tx, err := h.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	qtx := h.Repo.WithTx(tx)

	
	_, err = qtx.UpdateDetailsParent(ctx, repository.UpdateDetailsParentParams{
		Original:   req.Body.Original,
		Duplicates: req.Body.Duplicates,
	})
	if err != nil {
		return nil, fmt.Errorf("Failed to update details ticket ownership: %w", err)
	}

	
	err = qtx.MergeEmbeddings(ctx, repository.MergeEmbeddingsParams{
		Original:  req.Body.Original,
		Duplcates: req.Body.Duplicates,
	})
	if err != nil {
		return nil, fmt.Errorf("Failed to merge embeddings: %w", err)
	}

	
	err = qtx.DeleteAfterMerge(ctx, repository.DeleteAfterMergeParams{
		Duplicates: req.Body.Duplicates,
	})
	if err != nil {
		return nil, err
	}

	
	newValue, _ := json.Marshal(map[string]interface{}{
		"merged_tickets": req.Body.Duplicates,
	})
	description := fmt.Sprintf("Merged %d duplicate tickets", len(req.Body.Duplicates))
	_, err = qtx.CreateHistoryEntry(ctx, repository.CreateHistoryEntryParams{
		TicketID:    req.Body.Original,
		Action:      repository.HistoryActionMerged,
		NewValue:    newValue,
		Description: &description,
	})
	if err != nil {
		return nil, err
	}

	tx.Commit(ctx)

	return resp, nil
}


type GetSimilarRequest struct {
	ID uuid.UUID `path:"id"`
}

type GetSimilarResponse struct {
	Body struct {
		Similar []repository.GetSimilarTicketsRow `json:"similar"`
	}
}

func (h *TicketHandler) GetSimilar(ctx context.Context, req *GetSimilarRequest) (*GetSimilarResponse, error) {
	resp := new(GetSimilarResponse)

	similar, err := h.Repo.GetSimilarTickets(ctx, repository.GetSimilarTicketsParams{
		TargetID: req.ID,
	})
	if err != nil {
		return nil, err
	}

	resp.Body.Similar = similar
	return resp, nil
}
