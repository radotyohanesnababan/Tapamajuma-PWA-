package main

import (
	"crypto/tls"
	"fmt"
	"log"
	"os"
	"sync"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	gormMysql "gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type ActivityLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	SchoolID  uint      `gorm:"index:idx_school_created" json:"school_id"`
	UserID    int       `json:"user_id"`
	Action    string    `json:"action"`
	CreatedAt time.Time `gorm:"index:idx_school_created" json:"created_at"` // composite index, query utama selalu school_id + range tanggal
}

func (ActivityLog) TableName() string {
	return "logger_activity_logs" // hindari bentrok nama
}

var db *gorm.DB


// --- Cache API key per tenant, biar gak query DB tiap request ---
var tenantCache = struct {
	sync.RWMutex
	keys map[string]uint // api_key -> school_id
}{keys: make(map[string]uint)}

func refreshTenantCache() {
	var schools []struct {
		ID     uint
		APIKey string
	}
	if err := db.Table("schools"). // ganti dbCentral -> db
		Select("id, JSON_UNQUOTE(JSON_EXTRACT(config, '$.logger_api_key')) as api_key").
		Where("JSON_EXTRACT(config, '$.logger_api_key') IS NOT NULL").
		Find(&schools).Error; err != nil {
		log.Println("Gagal refresh tenant cache:", err)
		return
	}

	newKeys := make(map[string]uint, len(schools))
	for _, s := range schools {
		newKeys[s.APIKey] = s.ID
	}

	tenantCache.Lock()
	tenantCache.keys = newKeys
	tenantCache.Unlock()
}

// --- Dedup in-memory, ganti query DB per log ---
var dedupCache = struct {
	sync.Mutex
	last map[string]time.Time // key: "schoolID:userID:action"
}{last: make(map[string]time.Time)}

func isDuplicate(schoolID uint, userID int, action string) bool {
	key := fmt.Sprintf("%d:%d:%s", schoolID, userID, action)
	dedupCache.Lock()
	defer dedupCache.Unlock()
	if t, ok := dedupCache.last[key]; ok && time.Since(t).Seconds() < 2 {
		return true
	}
	dedupCache.last[key] = time.Now()
	return false
}

// bersihin entry dedup yang udah lama biar map gak numpuk terus
func cleanupDedupCache() {
	dedupCache.Lock()
	defer dedupCache.Unlock()
	for k, t := range dedupCache.last {
		if time.Since(t) > 5*time.Minute {
			delete(dedupCache.last, k)
		}
	}
}
func main() {
fmt.Println("Memulai Service Logger TAPAMAJUMA di port 5000...")
	godotenv.Load()

	mysql.RegisterTLSConfig("tidb", &tls.Config{MinVersion: tls.VersionTLS12})

	// satu DSN aja, arahkan ke tapamajuma_central
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "root:@tcp(127.0.0.1:3307)/tapamajuma_central?charset=utf8mb4&parseTime=True&loc=Local"
	}

	var err error
	db, err = gorm.Open(gormMysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal konek database: ", err)
	}

	db.AutoMigrate(&ActivityLog{})

	refreshTenantCache()

	// refresh tenant cache berkala
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		for range ticker.C {
			refreshTenantCache()
		}
	}()

	cleanupOldLogs()
	go func() {
		ticker := time.NewTicker(24 * time.Hour)
		for range ticker.C {
			cleanupOldLogs()
		}
	}()

	// bersihin dedup cache berkala
	go func() {
		ticker := time.NewTicker(10 * time.Minute)
		for range ticker.C {
			cleanupDedupCache()
		}
	}()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "https://tapamajuma.smpn1siborongborong.sch.id",
		AllowHeaders: "Origin, Content-Type, Accept, X-Tenant-API-Key",
	}))

	api := app.Group("/api", tenantAuthMiddleware)
	api.Post("/logs", createLog)
	api.Get("/logs", getLogs)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5050"
	}
	log.Fatal(app.Listen(":" + port))
}

func tenantAuthMiddleware(c *fiber.Ctx) error {
	apiKey := c.Get("X-Tenant-API-Key")
	tenantCache.RLock()
	schoolID, ok := tenantCache.keys[apiKey]
	tenantCache.RUnlock()

	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "invalid tenant key"})
	}
	c.Locals("school_id", schoolID)
	return c.Next()
}

func createLog(c *fiber.Ctx) error {
	schoolID := c.Locals("school_id").(uint)

	logEntry := new(ActivityLog)
	if err := c.BodyParser(logEntry); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	logEntry.SchoolID = schoolID // paksa dari token, bukan dari body

	if isDuplicate(schoolID, logEntry.UserID, logEntry.Action) {
		return c.Status(200).JSON(fiber.Map{
			"message": "Log duplikat diabaikan (spam protection)",
			"status":  "ignored",
		})
	}

	logEntry.CreatedAt = time.Now()
	db.Create(logEntry)

	return c.Status(201).JSON(fiber.Map{
		"message": "Log berhasil disimpan",
		"data": fiber.Map{
			"id":         logEntry.ID,
			"school_id":  logEntry.SchoolID,
			"user_id":    logEntry.UserID,
			"action":     logEntry.Action,
			"created_at": logEntry.CreatedAt.Format("2006-01-02 15:04:05"),
		},
	})
}

func cleanupOldLogs() {
	cutoff := time.Now().AddDate(0, 0, -7)
	result := db.Where("created_at < ?", cutoff).Delete(&ActivityLog{})
	if result.Error != nil {
		log.Println("Gagal cleanup log lama:", result.Error)
		return
	}
	if result.RowsAffected > 0 {
		log.Printf("Cleanup: %d log lama (>7 hari) dihapus\n", result.RowsAffected)
	}
}

func getLogs(c *fiber.Ctx) error {
	schoolID := c.Locals("school_id").(uint)

	page, _ := strconv.Atoi(c.Query("page", "1"))
	if page < 1 {
		page = 1
	}
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	query := db.Where("school_id = ?", schoolID)

	// filter per tanggal: ?date=2026-08-08
	if dateStr := c.Query("date"); dateStr != "" {
		start, err := time.Parse("2006-01-02", dateStr)
		if err == nil {
			end := start.Add(24 * time.Hour)
			query = query.Where("created_at >= ? AND created_at < ?", start, end)
		}
	}

	var total int64
	query.Model(&ActivityLog{}).Count(&total)

	var logs []ActivityLog
	query.Order("created_at desc").
		Offset((page - 1) * perPage).
		Limit(perPage).
		Find(&logs)

	return c.JSON(fiber.Map{
		"data": logs,
		"meta": fiber.Map{
			"page":      page,
			"per_page":  perPage,
			"total":     total,
			"last_page": int((total + int64(perPage) - 1) / int64(perPage)),
		},
	})
}