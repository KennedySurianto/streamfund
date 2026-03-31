package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/kennedysrnt/streamfund-backend/internal/domain"
	"github.com/kennedysrnt/streamfund-backend/pkg/sse"
)

type donationService struct {
	repo       domain.DonationRepository
	userRepo   domain.UserRepository
	sseManager *sse.Manager
}

func NewDonationService(repo domain.DonationRepository, userRepo domain.UserRepository, sseManager *sse.Manager) domain.DonationService {
	return &donationService{
		repo:       repo,
		userRepo:   userRepo,
		sseManager: sseManager,
	}
}

func (s *donationService) InitiateDonation(ctx context.Context, donation *domain.Donation) (*domain.Donation, error) {
	if donation.Amount <= 0 {
		return nil, errors.New("donation amount must be greater than zero")
	}

	if donation.SenderName == "" {
		donation.SenderName = "Anonymous"
	}

	err := s.repo.Create(ctx, donation)
	if err != nil {
		return nil, err
	}

	return donation, nil
}

func (s *donationService) ConfirmPayment(ctx context.Context, transactionID uuid.UUID) error {
	// 1. Update the database
	err := s.repo.UpdateStatus(ctx, transactionID, "success")
	if err != nil {
		return err
	}

	// 2. Fetch the full donation details
	donation, err := s.repo.GetByID(ctx, transactionID)
	if err != nil {
		return err
	}

	// 3. Fetch the receiver's user profile to get their username
	receiver, err := s.userRepo.GetByID(ctx, donation.ReceiverID)
	if err != nil {
		return err
	}

	// 4. FIRE THE REAL-TIME EVENT!
	s.sseManager.Broadcast(receiver.Username, *donation)

	return nil
}

func (s *donationService) GetLeaderboard(ctx context.Context) ([]domain.Donation, error) {
	return s.repo.GetTopDonations(ctx, 10) // Fetch top 10
}
