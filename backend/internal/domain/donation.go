package domain

import (
	"context"
	"time"
	"github.com/google/uuid"
)

type Donation struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ReceiverID  uuid.UUID `gorm:"type:uuid;not null;index" json:"receiver_id"`
	SenderName  string    `gorm:"type:varchar(50);default:'Anonymous'" json:"sender_name"`
	Amount      float64   `gorm:"type:decimal(15,2);not null;index:idx_donations_amount_desc,sort:desc" json:"amount"`
	Message     string    `gorm:"type:text" json:"message"`
	Status      string    `gorm:"type:varchar(20);default:'pending'" json:"status"`
	PaymentLink string    `gorm:"type:varchar(255)" json:"payment_link,omitempty"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

type DonationRepository interface {
	Create(ctx context.Context, donation *Donation) error
	UpdateStatus(ctx context.Context, id uuid.UUID, status string) error
	GetByID(ctx context.Context, id uuid.UUID) (*Donation, error)
	GetTopDonations(ctx context.Context, limit int) ([]Donation, error)
}

type DonationService interface {
	InitiateDonation(ctx context.Context, donation *Donation) (*Donation, error)
	ConfirmPayment(ctx context.Context, transactionID uuid.UUID) error
	GetLeaderboard(ctx context.Context) ([]Donation, error)
}