package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                 uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Username           string    `gorm:"type:varchar(50);uniqueIndex;not null" json:"username"`
	Email              string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	PasswordHash       string    `gorm:"type:varchar(255);not null" json:"-"`
	ProfilePicture     []byte    `gorm:"type:bytea" json:"profile_picture,omitempty"`
	IsAnonymousAllowed bool      `gorm:"default:true" json:"is_anonymous_allowed"`
	CreatedAt          time.Time `gorm:"autoCreateTime" json:"created_at"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type PublicProfile struct {
	ID                 uuid.UUID `json:"id"`
	Username           string    `json:"username"`
	ProfilePicture     string    `json:"profile_picture,omitempty"`
	IsAnonymousAllowed bool      `json:"is_anonymous_allowed"`
}

type UpdateProfileRequest struct {
	Username        string `json:"username"`
	ProfilePicture  string `json:"profile_picture"`
	OldPassword     string `json:"old_password"`
	NewPassword     string `json:"new_password"`
	ConfirmPassword string `json:"confirm_password"`
}

type UserRepository interface {
	Create(ctx context.Context, user *User) error
	GetByID(ctx context.Context, id uuid.UUID) (*User, error)
	GetByUsername(ctx context.Context, username string) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	Update(ctx context.Context, user *User) error
	GetFeatured(ctx context.Context, limit int) ([]*User, error)
}

type UserService interface {
	RegisterUser(ctx context.Context, req *User) error
	LoginUser(ctx context.Context, email, password string) (string, *User, error)
	GetPublicProfile(ctx context.Context, username string) (*PublicProfile, error)
	UpdateProfile(ctx context.Context, userID uuid.UUID, req *UpdateProfileRequest) (*User, error)
	GetFeaturedCreators(ctx context.Context) ([]PublicProfile, error)
}
