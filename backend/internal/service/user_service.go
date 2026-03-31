package service

import (
	"context"
	"errors"
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/kennedysrnt/streamfund-backend/internal/domain"
	"golang.org/x/crypto/bcrypt"
)

type userService struct {
	repo domain.UserRepository
}

// NewUserService injects the repository into the service
func NewUserService(repo domain.UserRepository) domain.UserService {
	return &userService{repo: repo}
}

func (s *userService) RegisterUser(ctx context.Context, user *domain.User) error {
	if user.Username == "" || user.Email == "" || user.PasswordHash == "" {
		return errors.New("missing required fields")
	}

	// Hash the raw password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.PasswordHash), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.PasswordHash = string(hashedPassword)

	return s.repo.Create(ctx, user)
}

func (s *userService) LoginUser(ctx context.Context, email, password string) (string, *domain.User, error) {
	// Use the interface method instead of casting to repository struct
	user, err := s.repo.GetByEmail(ctx, email)
	if err != nil {
		return "", nil, errors.New("invalid credentials")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		return "", nil, errors.New("invalid credentials")
	}

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Fatal("JWT_SECRET environment variable is required")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", nil, err
	}

	return tokenString, user, nil
}

func (s *userService) GetPublicProfile(ctx context.Context, username string) (*domain.PublicProfile, error) {
	user, err := s.repo.GetByUsername(ctx, username)
	if err != nil {
		return nil, errors.New("user not found")
	}

	return &domain.PublicProfile{
		ID:                 user.ID,
		Username:           user.Username,
		ProfilePicture:     string(user.ProfilePicture),
		IsAnonymousAllowed: user.IsAnonymousAllowed,
	}, nil
}

func (s *userService) UpdateProfile(ctx context.Context, userID uuid.UUID, req *domain.UpdateProfileRequest) (*domain.User, error) {
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// 1. Update Username
	if req.Username != "" && req.Username != user.Username {
		// Check if username is taken
		existing, _ := s.repo.GetByUsername(ctx, req.Username)
		if existing != nil && existing.ID != user.ID {
			return nil, errors.New("username is already taken")
		}
		user.Username = req.Username
	}

	// 2. Update Profile Picture
	if req.ProfilePicture != "" {
		user.ProfilePicture = []byte(req.ProfilePicture)
	}

	// 3. Update Password
	if req.OldPassword != "" || req.NewPassword != "" {
		if req.OldPassword == "" || req.NewPassword == "" || req.ConfirmPassword == "" {
			return nil, errors.New("all password fields are required to change password")
		}

		if req.NewPassword != req.ConfirmPassword {
			return nil, errors.New("new passwords do not match")
		}

		err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.OldPassword))
		if err != nil {
			return nil, errors.New("incorrect old password")
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}
		user.PasswordHash = string(hashedPassword)
	}

	// Save to DB
	if err := s.repo.Update(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *userService) GetFeaturedCreators(ctx context.Context) ([]domain.PublicProfile, error) {
	users, err := s.repo.GetFeatured(ctx, 9) // Get top 9 creators
	if err != nil {
		return nil, err
	}

	var profiles []domain.PublicProfile
	for _, u := range users {
		profiles = append(profiles, domain.PublicProfile{
			ID:                 u.ID,
			Username:           u.Username,
			ProfilePicture:     string(u.ProfilePicture),
			IsAnonymousAllowed: u.IsAnonymousAllowed,
		})
	}
	return profiles, nil
}
