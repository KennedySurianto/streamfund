# ==============================================================================
# Variables

BACKEND_DIR := ./backend
FRONTEND_DIR := ./frontend

# ==============================================================================
# Development Targets

.PHONY: dev dev-be dev-fe

# Run both frontend and backend concurrently
dev:
	@echo "Starting Streamfund monorepo..."
	@$(MAKE) -j 2 dev-be dev-fe

# Start the Go backend
dev-be:
	@echo "Starting Go backend..."
	cd $(BACKEND_DIR) && go run ./cmd/api/main.go

# Start the Next.js frontend (pnpm)
dev-fe:
	@echo "Starting Next.js frontend..."
	cd $(FRONTEND_DIR) && pnpm dev

# ==============================================================================
# Utility Targets

.PHONY: install clean

# Install dependencies for both projects
install:
	@echo "Installing backend dependencies..."
	cd $(BACKEND_DIR) && go mod tidy
	@echo "Installing frontend dependencies..."
	cd $(FRONTEND_DIR) && pnpm install

# Clean up build artifacts
clean:
	@echo "Cleaning up..."
	cd $(BACKEND_DIR) && rm -rf bin/
	cd $(FRONTEND_DIR) && rm -rf .next/ node_modules/