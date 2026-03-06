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

type TestUser struct {
	Email        string
	Password     string
	Role         string
	FirstName    string
	LastName     string
	MiddleName   string
	DepartmentID *int32
}

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

	
	users := []TestUser{
		{
			Email:      "admin@crm.local",
			Password:   "admin123",
			Role:       "admin",
			FirstName:  "Администратор",
			LastName:   "Системный",
			MiddleName: "",
		},
		{
			Email:        "gkh@crm.local",
			Password:     "gkh123",
			Role:         "executor",
			FirstName:    "Иван",
			LastName:     "Петров",
			MiddleName:   "Сергеевич",
			DepartmentID: intPtr(1), 
		},
		{
			Email:        "transport@crm.local",
			Password:     "transport123",
			Role:         "executor",
			FirstName:    "Мария",
			LastName:     "Иванова",
			MiddleName:   "Александровна",
			DepartmentID: intPtr(2), 
		},
		{
			Email:        "ecology@crm.local",
			Password:     "ecology123",
			Role:         "executor",
			FirstName:    "Алексей",
			LastName:     "Смирнов",
			MiddleName:   "Викторович",
			DepartmentID: intPtr(3), 
		},
	}

	fmt.Println("🚀 Creating test users...")
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

	for _, user := range users {
		
		hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("❌ Failed to hash password for %s: %v\n", user.Email, err)
			continue
		}

		
		query := `
			INSERT INTO users (
				id, email, role, status, 
				first_name, last_name, middle_name, password_hash, department_id
			) VALUES (
				$1, $2, $3, 'active',
				$4, $5, $6, $7, $8
			)
			ON CONFLICT (email) DO UPDATE SET
				password_hash = EXCLUDED.password_hash,
				role = EXCLUDED.role,
				status = EXCLUDED.status,
				department_id = EXCLUDED.department_id
			RETURNING id
		`

		var id uuid.UUID
		err = pool.QueryRow(
			context.Background(),
			query,
			uuid.New(),
			user.Email,
			user.Role,
			user.FirstName,
			user.LastName,
			user.MiddleName,
			string(hash),
			user.DepartmentID,
		).Scan(&id)

		if err != nil {
			log.Printf("❌ Failed to create user %s: %v\n", user.Email, err)
			continue
		}

		deptInfo := "Все департаменты"
		if user.DepartmentID != nil {
			deptInfo = fmt.Sprintf("Департамент ID: %d", *user.DepartmentID)
		}

		fmt.Printf("✅ %s %s (%s)\n", user.FirstName, user.LastName, user.Email)
		fmt.Printf("   🔑 Пароль: %s | 👤 Роль: %s | 🏢 %s\n", user.Password, user.Role, deptInfo)
		fmt.Println()
	}

	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Println("🌐 Login at: http://localhost:3000/crm/login")
	fmt.Println()
	fmt.Println("📋 Тестовые учетные данные:")
	fmt.Println("   • admin@crm.local / admin123 (Администратор - видит всё)")
	fmt.Println("   • gkh@crm.local / gkh123 (ЖКХ - только обращения ЖКХ)")
	fmt.Println("   • transport@crm.local / transport123 (Транспорт)")
	fmt.Println("   • ecology@crm.local / ecology123 (Экология)")
}

func intPtr(i int32) *int32 {
	return &i
}
