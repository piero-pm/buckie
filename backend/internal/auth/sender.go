package auth

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
)

// CodeSender delivers a sign-in code to an email address.
type CodeSender interface {
	Send(email, code string) error
}

// NewSender picks the right sender for the environment:
//   - DEV_MODE=true  -> logs the code to stdout (no email sent; local dev)
//   - SMTP_HOST set  -> sends real email via that SMTP server (any provider)
//   - otherwise      -> logs a redacted line (production without SMTP config)
//
// SMTP auth uses PLAIN over the configured host/port/from/credentials.
func NewSender() CodeSender {
	if os.Getenv("DEV_MODE") == "true" {
		return &logSender{}
	}
	if host := os.Getenv("SMTP_HOST"); host != "" {
		return newSMTPSender(host)
	}
	return &logSender{redact: true}
}

// logSender prints the code (dev) or a redacted line (no SMTP configured).
type logSender struct{ redact bool }

func (s *logSender) Send(email, code string) error {
	if s.redact {
		log.Printf("sign-in code issued for %s (no SMTP_HOST set; not delivered)", email)
		return nil
	}
	fmt.Printf("DEV sign-in code for %s: %s\n", email, code)
	return nil
}

// smtpSender sends the one-time code via transactional SMTP.
type smtpSender struct {
	addr string // host:port
	from string
	auth smtp.Auth
}

func newSMTPSender(host string) *smtpSender {
	port := envOr("SMTP_PORT", "587")
	user := os.Getenv("SMTP_USER")
	pass := os.Getenv("SMTP_PASS")
	from := envOr("SMTP_FROM", user)
	var auth smtp.Auth
	if user != "" {
		auth = smtp.PlainAuth("", user, pass, host)
	}
	return &smtpSender{addr: host + ":" + port, from: from, auth: auth}
}

func (s *smtpSender) Send(email, code string) error {
	msg := "From: " + s.from + "\r\n" +
		"To: " + email + "\r\n" +
		"Subject: Your Penny Saver sign-in code\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/plain; charset=UTF-8\r\n" +
		"\r\n" +
		"Your sign-in code is " + code + ". It expires in 10 minutes.\r\n"
	return smtp.SendMail(s.addr, s.auth, s.from, []string{email}, []byte(msg))
}

func envOr(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
