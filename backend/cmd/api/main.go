package main

import (
	"log"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/kennedysrnt/streamfund-backend/internal/controller"
	"github.com/kennedysrnt/streamfund-backend/internal/middleware"
	"github.com/kennedysrnt/streamfund-backend/internal/repository"
	"github.com/kennedysrnt/streamfund-backend/internal/service"
	"github.com/kennedysrnt/streamfund-backend/pkg/database"
	"github.com/kennedysrnt/streamfund-backend/pkg/sse"
)

func main() {
	// Load env
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, relying on system environment variables")
	}

	// Initialize GORM Database
	db, err := database.NewPostgresDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Initialize the global SSE Manager
	sseManager := sse.NewManager()

	// Repositories
	userRepo := repository.NewUserRepository(db)
	donationRepo := repository.NewDonationRepository(db)

	// Services
	userService := service.NewUserService(userRepo)
	donationService := service.NewDonationService(donationRepo, userRepo, sseManager)

	// Controllers
	userController := controller.NewUserController(userService)
	donationController := controller.NewDonationController(donationService)
	sseController := controller.NewSSEController(sseManager)

	// Setup Router
	router := gin.Default()

	// Configure Trusted Proxies dynamically
	trustedProxies := os.Getenv("TRUSTED_PROXIES")
	if trustedProxies != "" {
		router.SetTrustedProxies(strings.Split(trustedProxies, ","))
	} else {
		router.SetTrustedProxies([]string{"127.0.0.1"})
	}

	// CORS middleware dynamically using environment variable
	router.Use(func(c *gin.Context) {
		corsOrigin := os.Getenv("CORS_ORIGIN")
		if corsOrigin == "" {
			corsOrigin = "http://localhost:3000" // Fallback
		}

		c.Writer.Header().Set("Access-Control-Allow-Origin", corsOrigin)
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := router.Group("/api")
	{
		// Public Routes
		api.POST("/users/register", userController.Register)
		api.POST("/users/login", userController.Login)
		
		api.GET("/donations/leaderboard", donationController.Leaderboard)
		api.POST("/donations", donationController.Create)
		api.POST("/donations/:id/complete", donationController.CompletePayment)
		api.GET("/stream/:username", sseController.StreamAlerts)

		api.GET("/creators/featured", userController.GetFeatured)
		api.GET("/users/:username", userController.GetProfile)

		// Protected Routes (Requires JWT Token)
		protected := api.Group("/")
		protected.Use(middleware.RequireAuth())
		{
			protected.PUT("/users/profile", userController.UpdateProfile)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("PORT environment variable is required")
	}

	log.Println("Server starting on port", port)
	router.Run(":" + port)
}
