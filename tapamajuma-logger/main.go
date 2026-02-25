package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type ActivityLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    int       `json:"user_id"`
	Action    string    `json:"action"`
	CreatedAt time.Time `json:"created_at"` // Gunakan time.Time agar otomatis jadi datetime di MySQL
}

var db *gorm.DB

func main() {
	fmt.Println("Memulai Service Logger TAPAMAJUMA di port 5000...")
	godotenv.Load()

	// Pastikan DSN sesuai dengan database di Domcloud nanti
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "root:@tcp(127.0.0.1:3306)/tapamajuma_db?charset=utf8mb4&parseTime=True&loc=Local"
	}

	var err error
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal konek database: ", err)
	}

	db.AutoMigrate(&ActivityLog{})

	app := fiber.New()

	// Penting untuk Vercel: Izinkan CORS agar Frontend bisa nembak API
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // Nantinya bisa diganti jadi URL Vercel kamu demi keamanan
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	app.Post("/api/logs", createLog)

	// Jalankan di port yang disediakan Domcloud atau default 5000
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	log.Fatal(app.Listen(":" + port))
}

func createLog(c *fiber.Ctx) error {
	logEntry := new(ActivityLog)
	if err := c.BodyParser(logEntry); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	// --- LOGIKA ANTI DUPLIKAT ---
	var lastLog ActivityLog
	// Cari log terakhir dengan UserID dan Action yang sama
	db.Where("user_id = ? AND action = ?", logEntry.UserID, logEntry.Action).
		Order("created_at desc").
		First(&lastLog)

	// Jika log ditemukan dan jaraknya kurang dari 2 detik, abaikan
	if lastLog.ID > 0 && time.Since(lastLog.CreatedAt).Seconds() < 2 {
		return c.Status(200).JSON(fiber.Map{
			"message": "Log duplikat diabaikan (spam protection)",
			"status":  "ignored",
		})
	}

	// Simpan log baru
	logEntry.CreatedAt = time.Now()
	db.Create(logEntry)

	return c.Status(201).JSON(fiber.Map{
		"message": "Log berhasil disimpan",
		"data": fiber.Map{
			"id":         logEntry.ID,
			"user_id":    logEntry.UserID,
			"action":     logEntry.Action,
			"created_at": logEntry.CreatedAt.Format("2006-01-02 15:04:05"), 
		},
	})
}