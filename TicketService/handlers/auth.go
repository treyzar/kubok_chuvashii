package handlers

import (
	"context"
	"errors"

	"github.com/SomeSuperCoder/OnlineShop/repository"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	Repo *repository.Queries
	Pool *pgxpool.Pool
}



type LoginRequest struct {
	Body struct {
		Email    string `json:"email" format:"email" maxLength:"255"`
		Password string `json:"password" minLength:"6" maxLength:"100"`
	}
}

type LoginResponse struct {
	Body struct {
		User   repository.User `json:"user"`
		UserID string          `json:"user_id"` 
	}
}

func (h *AuthHandler) Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error) {
	resp := new(LoginResponse)

	
	user, err := h.Repo.GetUserByEmail(ctx, repository.GetUserByEmailParams{Email: req.Body.Email})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("invalid email or password")
		}
		return nil, err
	}

	
	if user.PasswordHash == nil || *user.PasswordHash == "" {
		return nil, errors.New("password not set for this user")
	}

	
	err = bcrypt.CompareHashAndPassword([]byte(*user.PasswordHash), []byte(req.Body.Password))
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	resp.Body.User = user
	resp.Body.UserID = user.ID.String()

	return resp, nil
}
