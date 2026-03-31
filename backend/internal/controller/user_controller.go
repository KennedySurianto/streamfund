package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kennedysrnt/streamfund-backend/internal/domain"
)

type UserController struct {
	service domain.UserService
}

// NewUserController injects the service into the controller
func NewUserController(service domain.UserService) *UserController {
	return &UserController{service: service}
}

func (c *UserController) Register(ctx *gin.Context) {
	var req domain.RegisterRequest // Use the new Request struct
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Map request to domain model
	user := domain.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: req.Password, // Pass raw password to service for hashing
	}

	if err := c.service.RegisterUser(ctx.Request.Context(), &user); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}

func (c *UserController) Login(ctx *gin.Context) {
	var req domain.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	token, user, err := c.service.LoginUser(ctx.Request.Context(), req.Email, req.Password)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

func (c *UserController) GetProfile(ctx *gin.Context) {
	username := ctx.Param("username")
	profile, err := c.service.GetPublicProfile(ctx.Request.Context(), username)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Creator not found"})
		return
	}

	ctx.JSON(http.StatusOK, profile)
}

func (c *UserController) UpdateProfile(ctx *gin.Context) {
	// Extract userID from the AuthMiddleware
	userIDVal, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID := userIDVal.(uuid.UUID)

	var req domain.UpdateProfileRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedUser, err := c.service.UpdateProfile(ctx.Request.Context(), userID, &req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return updated user data (excluding password)
	ctx.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"user": gin.H{
			"id":              updatedUser.ID,
			"username":        updatedUser.Username,
			"email":           updatedUser.Email,
			"profile_picture": string(updatedUser.ProfilePicture),
		},
	})
}

func (c *UserController) GetFeatured(ctx *gin.Context) {
	creators, err := c.service.GetFeaturedCreators(ctx.Request.Context())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch creators"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"creators": creators})
}
