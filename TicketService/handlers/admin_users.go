package handlers

import (
	"context"

	"github.com/SomeSuperCoder/OnlineShop/internal"
	"github.com/SomeSuperCoder/OnlineShop/repository"
	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type AdminUsersHandler struct {
	Repo *repository.Queries
	Pool *pgxpool.Pool
}



type ListUsersRequest struct {
	Role   string `query:"role" enum:"admin,org,executor,"`
	Status string `query:"status" enum:"active,blocked,"`
	Email  string `query:"email"`
	Limit  int32  `query:"limit" default:"20" maximum:"100"`
	Offset int32  `query:"offset" default:"0"`
}

type ListUsersResponse struct {
	Body struct {
		Users []repository.ListUsersRow `json:"users"`
		Total int64                     `json:"total"`
	}
}

func (h *AdminUsersHandler) List(ctx context.Context, req *ListUsersRequest) (*ListUsersResponse, error) {
	if !internal.IsAdmin(ctx) {
		return nil, huma.Error403Forbidden("Admin access required")
	}
	resp := new(ListUsersResponse)

	
	var role repository.NullUserRole
	if req.Role != "" {
		role.UserRole = repository.UserRole(req.Role)
		role.Valid = true
	}

	var status repository.NullUserStatus
	if req.Status != "" {
		status.UserStatus = repository.UserStatus(req.Status)
		status.Valid = true
	}

	var email *string
	if req.Email != "" {
		email = &req.Email
	}

	users, err := h.Repo.ListUsers(ctx, repository.ListUsersParams{
		Limit:  req.Limit,
		Offset: req.Offset,
		Role:   role,
		Status: status,
		Email:  email,
	})
	if err != nil {
		return nil, err
	}

	total, err := h.Repo.CountUsers(ctx, repository.CountUsersParams{
		Role:   role,
		Status: status,
		Email:  email,
	})
	if err != nil {
		return nil, err
	}

	resp.Body.Users = users
	resp.Body.Total = total

	return resp, nil
}



type CreateUserRequest struct {
	Body struct {
		Email        string  `json:"email" format:"email" maxLength:"255"`
		Role         string  `json:"role" enum:"admin,org,executor"`
		Password     *string `json:"password,omitempty" minLength:"6" maxLength:"100"`
		DepartmentID *int32  `json:"department_id,omitempty"`
		FirstName    *string `json:"first_name,omitempty" maxLength:"100"`
		LastName     *string `json:"last_name,omitempty" maxLength:"100"`
		MiddleName   *string `json:"middle_name,omitempty" maxLength:"100"`
	}
}

type CreateUserResponse struct {
	Body repository.User `json:"user"`
}

func (h *AdminUsersHandler) Create(ctx context.Context, req *CreateUserRequest) (*CreateUserResponse, error) {
	if !internal.IsAdmin(ctx) {
		return nil, huma.Error403Forbidden("Admin access required")
	}
	resp := new(CreateUserResponse)

	
	var passwordHash *string
	if req.Body.Password != nil && *req.Body.Password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(*req.Body.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}
		hashStr := string(hash)
		passwordHash = &hashStr
	}

	user, err := h.Repo.CreateUser(ctx, repository.CreateUserParams{
		ID:           uuid.New(),
		Email:        req.Body.Email,
		Role:         repository.UserRole(req.Body.Role),
		Status:       repository.UserStatusActive,
		DepartmentID: req.Body.DepartmentID,
		FirstName:    req.Body.FirstName,
		LastName:     req.Body.LastName,
		MiddleName:   req.Body.MiddleName,
		PasswordHash: passwordHash,
	})
	if err != nil {
		return nil, err
	}

	resp.Body = user

	return resp, nil
}



type UpdateUserRequest struct {
	UserID uuid.UUID `path:"id"`
	Body   struct {
		Role         *string `json:"role,omitempty" enum:"admin,org,executor"`
		Status       *string `json:"status,omitempty" enum:"active,blocked"`
		DepartmentID *int32  `json:"department_id,omitempty"`
		FirstName    *string `json:"first_name,omitempty" maxLength:"100"`
		LastName     *string `json:"last_name,omitempty" maxLength:"100"`
		MiddleName   *string `json:"middle_name,omitempty" maxLength:"100"`
	}
}

type UpdateUserResponse struct {
	Body repository.User `json:"user"`
}

func (h *AdminUsersHandler) Update(ctx context.Context, req *UpdateUserRequest) (*UpdateUserResponse, error) {
	if !internal.IsAdmin(ctx) {
		return nil, huma.Error403Forbidden("Admin access required")
	}
	resp := new(UpdateUserResponse)

	
	var role repository.NullUserRole
	if req.Body.Role != nil {
		role.UserRole = repository.UserRole(*req.Body.Role)
		role.Valid = true
	}

	var status repository.NullUserStatus
	if req.Body.Status != nil {
		status.UserStatus = repository.UserStatus(*req.Body.Status)
		status.Valid = true
	}

	user, err := h.Repo.UpdateUser(ctx, repository.UpdateUserParams{
		ID:           req.UserID,
		Role:         role,
		Status:       status,
		DepartmentID: req.Body.DepartmentID,
		FirstName:    req.Body.FirstName,
		LastName:     req.Body.LastName,
		MiddleName:   req.Body.MiddleName,
	})
	if err != nil {
		return nil, err
	}

	resp.Body = user

	return resp, nil
}



type DeleteUserRequest struct {
	UserID uuid.UUID `path:"id"`
}

type DeleteUserResponse struct {
	Body repository.User `json:"user"`
}

func (h *AdminUsersHandler) Delete(ctx context.Context, req *DeleteUserRequest) (*DeleteUserResponse, error) {
	if !internal.IsAdmin(ctx) {
		return nil, huma.Error403Forbidden("Admin access required")
	}
	resp := new(DeleteUserResponse)

	user, err := h.Repo.DeleteUser(ctx, repository.DeleteUserParams{
		ID: req.UserID,
	})
	if err != nil {
		return nil, err
	}

	resp.Body = user

	return resp, nil
}
