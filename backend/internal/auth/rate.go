package auth

import (
	"net"
	"sync"
	"time"
)

const (
	rateWindow   = time.Hour
	rateMaxEmail = 3
	rateMaxIP    = 5
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

// allowCodeRequest checks per-IP then per-email rate limits.
func (r *rateLimiter) allowCodeRequest(email, remoteAddr string) bool {
	ip, _, err := net.SplitHostPort(remoteAddr)
	if err != nil {
		ip = remoteAddr
	}
	return r.allow("ip:"+ip, rateMaxIP) && r.allow("email:"+email, rateMaxEmail)
}
