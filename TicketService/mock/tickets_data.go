package main

import (
	"log"
	"time"

	"github.com/SomeSuperCoder/OnlineShop/repository"
)

// TicketData represents mock ticket data structure
type TicketData struct {
	description   string
	subcategoryID int32
	departmentID  *int32
	status        repository.TicketStatus
	createdAt     time.Time
	senderName    string
	senderPhone   *string
	senderEmail   *string
	lat           float64
	lng           float64
}

// ptr — вспомогательная функция для создания указателей
func ptr[T any](v T) *T {
	return &v
}

// getTicketsData возвращает моковые данные и логирует процесс
func getTicketsData() []TicketData {
	log.Println("--- Запуск генерации моковых данных для тикетов ---")
	
	tickets := []TicketData{
		// === ГРУППА 1: Проблемы с отоплением ===
		{
			description:   "В нашем доме на улице Ленина 45 уже неделю нет отопления. Температура в квартирах опустилась до 15 градусов. Жильцы, особенно дети и пожилые люди, мерзнут.",
			subcategoryID: 1, status: repository.TicketStatusOpen, departmentID: ptr(int32(2)),
			createdAt:  time.Now().Add(-7 * 24 * time.Hour),
			senderName: "Иванов Иван Иванович", senderPhone: ptr("+79001234567"), senderEmail: ptr("ivanov@example.com"),
			lat: 56.1324, lng: 47.2501,
		},
		{
			description:   "Холодные батареи в доме на улице Ленина 45. Отопление не работает уже 6 дней. В квартирах очень холодно, температура около 16 градусов. Дети болеют.",
			subcategoryID: 1, status: repository.TicketStatusOpen, departmentID: ptr(int32(2)),
			createdAt:  time.Now().Add(-6 * 24 * time.Hour),
			senderName: "Петрова Мария Сергеевна", senderPhone: ptr("+79002345678"), senderEmail: nil,
			lat: 56.1325, lng: 47.2502,
		},
		{
			description:   "Дом 45 по улице Ленина без отопления. Прошла неделя, а батареи холодные. Температура в помещениях 15-16 градусов. Просим срочно решить проблему!",
			subcategoryID: 1, status: repository.TicketStatusInit, departmentID: nil,
			createdAt:  time.Now().Add(-5 * 24 * time.Hour),
			senderName: "Смирнов Алексей Викторович", senderPhone: nil, senderEmail: ptr("smirnov@example.com"),
			lat: 56.1323, lng: 47.2500,
		},

		// === ГРУППА 2: Ямы на дорогах ===
		{
			description:   "На перекрестке улиц Гагарина и Мира образовалась огромная яма глубиной около 30 см. Несколько машин уже повредили колеса. Требуется срочный ремонт дорожного покрытия.",
			subcategoryID: 6, status: repository.TicketStatusOpen, departmentID: ptr(int32(3)),
			createdAt:  time.Now().Add(-10 * 24 * time.Hour),
			senderName: "Волков Дмитрий Александрович", senderPhone: ptr("+79003456789"), senderEmail: ptr("volkov@example.com"),
			lat: 56.1340, lng: 47.2520,
		},
		{
			description:   "Огромная яма на перекрестке Гагарина и Мира. Глубина примерно 25-30 см, ширина около метра. Машины объезжают по встречной полосе. Очень опасно!",
			subcategoryID: 6, status: repository.TicketStatusOpen, departmentID: ptr(int32(3)),
			createdAt:  time.Now().Add(-9 * 24 * time.Hour),
			senderName: "Новикова Елена Сергеевна", senderPhone: nil, senderEmail: ptr("novikova@example.com"),
			lat: 56.1341, lng: 47.2521,
		},

		// === Уникальные и прочие обращения ===
		{
			description:   "Из крана течет ржавая вода с неприятным запахом.",
			subcategoryID: 2, status: repository.TicketStatusOpen, departmentID: ptr(int32(2)),
			createdAt:  time.Now().Add(-3 * 24 * time.Hour),
			senderName: "Федорова Наталья Ивановна", senderPhone: ptr("+79001234560"), senderEmail: ptr("fedorova@example.com"),
			lat: 56.1335, lng: 47.2515,
		},
	}

	// Пример логирования результатов
	assignedCount := 0
	for _, t := range tickets {
		if t.departmentID != nil {
			assignedCount++
		}
	}

	log.Printf("Успешно сгенерировано тикетов: %d", len(tickets))
	log.Printf("Тикетов с назначенным департаментом: %d", assignedCount)
	log.Printf("Тикетов без департамента (Init): %d", len(tickets)-assignedCount)
	
	return tickets
}

func main() {
	// Настройка логгера (опционально: флаг даты и времени)
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	data := getTicketsData()
	
	// Вывод первого тикета для проверки
	if len(data) > 0 {
		log.Printf("Первый тикет в списке от: %s (Описание: %.30s...)", data[0].senderName, data[0].description)
	}
	
	log.Println("--- Работа завершена ---")
}