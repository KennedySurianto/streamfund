package controller

import (
	"io"
	"github.com/gin-gonic/gin"
	"github.com/kennedysrnt/streamfund-backend/pkg/sse"
)

type SSEController struct {
	manager *sse.Manager
}

func NewSSEController(manager *sse.Manager) *SSEController {
	return &SSEController{manager: manager}
}

// StreamAlerts handles GET /api/stream/:username
func (c *SSEController) StreamAlerts(ctx *gin.Context) {
	username := ctx.Param("username")

	// 1. Set SSE specific headers
	ctx.Writer.Header().Set("Content-Type", "text/event-stream")
	ctx.Writer.Header().Set("Cache-Control", "no-cache")
	ctx.Writer.Header().Set("Connection", "keep-alive")
	ctx.Writer.Header().Set("Access-Control-Allow-Origin", "*")

	// 2. Register the client in the Manager
	client := c.manager.AddClient(username)
	
	// 3. Ensure we clean up when the connection drops
	defer c.manager.RemoveClient(username, client)

	// 4. Listen for client disconnect
	clientGone := ctx.Request.Context().Done()

	// 5. Stream data using Gin's Stream method
	ctx.Stream(func(w io.Writer) bool {
		select {
		case <-clientGone:
			return false // Connection closed by client, stop streaming
		case donation := <-client.MessageChan:
			// Send the donation data as a JSON event
			ctx.SSEvent("donation_alert", donation)
			return true // Keep connection open
		}
	})
}