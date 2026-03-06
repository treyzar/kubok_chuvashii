package internal

import (
	"context"
	"strings"

	"github.com/SomeSuperCoder/OnlineShop/repository"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)



func AuthMiddleware(repo *repository.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetHeader("X-User-ID")
		if userID == "" {
			
			c.Next()
			return
		}

		
		uid, err := uuid.Parse(userID)
		if err != nil {
			c.Next()
			return
		}

		
		user, err := repo.GetUser(c.Request.Context(), repository.GetUserParams{ID: uid})
		if err != nil {
			c.Next()
			return
		}

		
		authUser := &AuthUser{
			ID:           user.ID,
			Email:        user.Email,
			Role:         user.Role,
			DepartmentID: user.DepartmentID,
		}

		ctx := SetUserContext(c.Request.Context(), authUser)
		c.Request = c.Request.WithContext(ctx)

		c.Next()
	}
}


func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		user := GetUserFromContext(c.Request.Context())
		if user == nil {
			c.JSON(401, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}
		c.Next()
	}
}


func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !IsAdmin(c.Request.Context()) {
			c.JSON(403, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}
		c.Next()
	}
}



func DepartmentFilter(ctx context.Context) *int32 {
	if IsAdmin(ctx) {
		return nil 
	}
	return GetUserDepartment(ctx)
}


func CanAccessTicket(ctx context.Context, ticketDepartmentID *int32) bool {
	if IsAdmin(ctx) {
		return true
	}

	userDept := GetUserDepartment(ctx)
	if userDept == nil || ticketDepartmentID == nil {
		return false
	}

	return *userDept == *ticketDepartmentID
}


func NormalizePath(path string) string {
	path = strings.TrimSuffix(path, "/")
	return strings.ToLower(path)
}
