package domain

import (
	"context"
)

type PaymentProvider interface {
	GenerateQRIS(ctx context.Context, orderID string, amount float64) (string, error)
	VerifyWebhookSignature(signature string, payload []byte) bool
}