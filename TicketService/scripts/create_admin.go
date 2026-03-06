package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	
	dbURL := os.Getenv("GOOSE_DBSTRING")
	if dbURL == "" {
		dbURL = "postgres://admin:password@localhost:5432/tickets_db"
	}

	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer pool.Close()

	
	email := "admin@crm.local"
	password := "admin123"
	
	
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v\n", err)
	}

	
	query := `
		INSERT INTO users (
			id, email, role, status, 
			first_name, last_name, middle_name, password_hash
		) VALUES (
			$1, $2, 'admin', 'active',
			$3, $4, $5, $6
		)
		ON CONFLICT (email) DO UPDATE SET
			password_hash = EXCLUDED.password_hash,
			role = EXCLUDED.role,
			status = EXCLUDED.status
		RETURNING id, email, role
	`

	var id uuid.UUID
	var returnedEmail, role string
	
	err = pool.QueryRow(
		context.Background(),
		query,
		uuid.New(),
		email,
		"Администратор",
		"Системный",
		"",
		string(hash),
	).Scan(&id, &returnedEmail, &role)

	if err != nil {
		log.Fatalf("Failed to create admin user: %v\n", err)
	}

	fmt.Println("✅ Admin user created successfully!")
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Printf("📧 Email:    %s\n", returnedEmail)
	fmt.Printf("🔑 Password: %s\n", password)
	fmt.Printf("👤 Role:     %s\n", role)
	fmt.Printf("🆔 ID:       %s\n", id)
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Println("\n🌐 Login at: http://localhost:3000/crm/login")
}
