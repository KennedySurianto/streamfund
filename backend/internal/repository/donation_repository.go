package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/kennedysrnt/streamfund-backend/internal/domain"
	"gorm.io/gorm"
)

type donationRepository struct {
	db *gorm.DB
}

func NewDonationRepository(db *gorm.DB) domain.DonationRepository {
	return &donationRepository{db: db}
}

func (r *donationRepository) Create(ctx context.Context, donation *domain.Donation) error {
	return r.db.WithContext(ctx).Create(donation).Error
}

func (r *donationRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	return r.db.WithContext(ctx).Model(&domain.Donation{}).Where("id = ?", id).Update("status", status).Error
}

func (r *donationRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Donation, error) {
	var donation domain.Donation
	err := r.db.WithContext(ctx).First(&donation, "id = ?", id).Error
	return &donation, err
}

func (r *donationRepository) GetTopDonations(ctx context.Context, limit int) ([]domain.Donation, error) {
	var donations []domain.Donation
	err := r.db.WithContext(ctx).
		Where("status = ?", "success").
		Order("amount DESC").
		Limit(limit).
		Find(&donations).Error
	return donations, err
}
