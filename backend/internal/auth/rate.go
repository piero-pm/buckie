package auth

import (
	"sync"
	"time"
)

const (
	rateWindow   = time.Hour
	rateMaxEmail = 10
	rateMaxIP    = 100
)

type rateLimiter struct {
	mu      sync.Mutex
	entries map[string]*rateEntry
}

type rateEntry struct {
	count     int
	windowEnd time.Time
}

func newRateLimiter() *rateLimiter {
	return &rateLimiter{entries: make(map[string]*rateEntry)}
}

func (r *rateLimiter) allow(key string, max int) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	now := time.Now()
	e, ok := r.entries[key]
	if !ok || now.After(e.windowEnd) {
		r.entries[key] = &rateEntry{count: 1, windowEnd: now.Add(rateWindow)}
		return true
	}
	if e.count >= max {
		return false
	}
	e.count++
	return true
}

// allowCodeRequest checks per-IP then per-email rate limits (BR-RL-2:
// 100/IP, 10/email per rolling hour). The IP is the originating client
// network, resolved by the handler via clientIP (BR-RL-1).
func (r *rateLimiter) allowCodeRequest(email, ip string) bool {
	return r.allow("ip:"+ip, rateMaxIP) && r.allow("email:"+email, rateMaxEmail)
}
