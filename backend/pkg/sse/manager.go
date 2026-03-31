package sse

import (
	"sync"
	"github.com/kennedysrnt/streamfund-backend/internal/domain"
)

// Client represents a single active connection (e.g., an open OBS browser source)
type Client struct {
	MessageChan chan domain.Donation
}

// Manager holds all active clients, grouped by the streamer's username
type Manager struct {
	// Map structure: username -> set of active clients
	clients map[string]map[*Client]bool
	mu      sync.RWMutex
}

func NewManager() *Manager {
	return &Manager{
		clients: make(map[string]map[*Client]bool),
	}
}

// AddClient creates a new channel for a specific username
func (m *Manager) AddClient(username string) *Client {
	m.mu.Lock()
	defer m.mu.Unlock()

	client := &Client{
		MessageChan: make(chan domain.Donation, 10), // Buffer of 10 to prevent blocking
	}

	if m.clients[username] == nil {
		m.clients[username] = make(map[*Client]bool)
	}
	m.clients[username][client] = true

	return client
}

// RemoveClient cleans up the channel when the user closes their browser/OBS
func (m *Manager) RemoveClient(username string, client *Client) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, ok := m.clients[username][client]; ok {
		delete(m.clients[username], client)
		close(client.MessageChan)
		
		// Cleanup the map if no clients are left for this user
		if len(m.clients[username]) == 0 {
			delete(m.clients, username)
		}
	}
}

// Broadcast sends a donation payload to all active overlays for a specific username
func (m *Manager) Broadcast(username string, donation domain.Donation) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if clients, ok := m.clients[username]; ok {
		for client := range clients {
			// Non-blocking send: if the client's channel is full, drop the message
			// to prevent the entire server from locking up.
			select {
			case client.MessageChan <- donation:
			default:
			}
		}
	}
}