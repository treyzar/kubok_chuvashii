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
	FirstName    *string
	LastName     *string
	MiddleName   *string
	Role         repository.UserRole
	DepartmentID *int32
}

func (u *AuthUser) GetFullName() string {
	if u.FirstName == nil && u.LastName == nil {
		return u.Email
	}
	
	parts := []string{}
	if u.LastName != nil {
		parts = append(parts, *u.LastName)
	}
	if u.FirstName != nil {
		parts = append(parts, *u.FirstName)
	}
	if u.MiddleName != nil {
		parts = append(parts, *u.MiddleName)
	}
	
	if len(parts) == 0 {
		return u.Email
	}
	
	result := ""
	for i, part := range parts {
		if i > 0 {
			result += " "
		}
		result += part
	}
	return result
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
