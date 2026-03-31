package controller

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kennedysrnt/streamfund-backend/internal/domain"
)

type DonationController struct {
	service domain.DonationService
}

func NewDonationController(service domain.DonationService) *DonationController {
	return &DonationController{service: service}
}

// Create handles POST /api/donations (When user clicks 'Donate' on creator page)
func (c *DonationController) Create(ctx *gin.Context) {
	var req domain.Donation
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
	}

	createdDonation, err := c.service.InitiateDonation(ctx.Request.Context(), &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "Donation initiated",
		"donation": createdDonation,
	})
}

// CompletePayment handles POST /api/donations/:id/complete (The Dummy Checkout Button)
func (c *DonationController) CompletePayment(ctx *gin.Context) {
	idParam := ctx.Param("id")
	donationID, err := uuid.Parse(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid donation ID format"})
		return
	}

	if err := c.service.ConfirmPayment(ctx.Request.Context(), donationID); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to complete payment"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Payment simulated successfully."})
}

// Leaderboard handles GET /api/donations/leaderboard
func (c *DonationController) Leaderboard(ctx *gin.Context) {
	donations, err := c.service.GetLeaderboard(ctx.Request.Context())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch leaderboard"})
		return
	}

	// If no donations exist yet, return an empty array instead of null
	if donations == nil {
		donations = []domain.Donation{}
	}

	ctx.JSON(http.StatusOK, gin.H{"leaderboard": donations})
}