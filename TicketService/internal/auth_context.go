package internal

import (
	"context"

	"github.com/SomeSuperCoder/OnlineShop/repository"
	"github.com/google/uuid"
)

type contextKey string

const userContextKey contextKey = "user"

type AuthUser struct {
	ID           uuid.UUID
	Email        string
	Role         repository.UserRole
	DepartmentID *int32
}

func SetUserContext(ctx context.Context, user *AuthUser) context.Context {
	return context.WithValue(ctx, userContextKey, user)
}

func GetUserFromContext(ctx context.Context) *AuthUser {
	user, ok := ctx.Value(userContextKey).(*AuthUser)
	if !ok {
		return nil
	}
	return user
}

func IsAdmin(ctx context.Context) bool {
	user := GetUserFromContext(ctx)
	return user != nil && user.Role == repository.UserRoleAdmin
}

func GetUserDepartment(ctx context.Context) *int32 {
	user := GetUserFromContext(ctx)
	if user == nil {
		return nil
	}
	return user.DepartmentID
}
