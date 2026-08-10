package auth

import (
	"fmt"
	"log"
	"os"
)

// CodeSender delivers a sign-in code to an email address.
// Slice 1: only the log sender is provided; replace with SMTP in a later slice.
type CodeSender interface {
	Send(email, code string) error
}

// NewSender returns a log-based sender for local development.
// In production (DEV_MODE unset or not "true"), the code is NOT logged.
func NewSender() CodeSender {
	return &logSender{dev: os.Getenv("DEV_MODE") == "true"}
}

type logSender struct{ dev bool }

func (s *logSender) Send(email, code string) error {
	if s.dev {
		// Slice 1 only: replace with real SMTP before production use.
		fmt.Printf("DEV sign-in code for %s: %s\n", email, code)
	} else {
		log.Printf("sign-in code issued for %s", email)
	}
	return nil
}
