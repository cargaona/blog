package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

func main() {
	token := os.Getenv("TELEGRAM_BOT_TOKEN")
	if token == "" {
		log.Fatal("TELEGRAM_BOT_TOKEN is required")
	}

	userIDStr := os.Getenv("TELEGRAM_USER_ID")
	if userIDStr == "" {
		log.Fatal("TELEGRAM_USER_ID is required")
	}

	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		log.Fatalf("Invalid TELEGRAM_USER_ID: %v", err)
	}

	repoPath := os.Getenv("BLOG_REPO_PATH")
	if repoPath == "" {
		repoPath = "/app/repo"
	}

	loc, err := time.LoadLocation("America/Argentina/Buenos_Aires")
	if err != nil {
		log.Printf("Warning: failed to load timezone, using UTC: %v", err)
		loc = time.UTC
	}

	bot, err := tgbotapi.NewBotAPI(token)
	if err != nil {
		log.Fatalf("Failed to create bot: %v", err)
	}

	log.Printf("Bot started as %s", bot.Self.UserName)

	u := tgbotapi.NewUpdate(0)
	u.Timeout = 60

	updates := bot.GetUpdatesChan(u)

	for update := range updates {
		if update.Message == nil {
			continue
		}

		// Check if sender is whitelisted
		if update.Message.From.ID != userID {
			continue
		}

		text := update.Message.Text

		// Handle /start
		if strings.HasPrefix(text, "/start") {
			msg := tgbotapi.NewMessage(update.Message.Chat.ID, "Welcome! Use /log <message> to post a new log entry.")
			bot.Send(msg)
			continue
		}

		// Handle /log command
		if strings.HasPrefix(text, "/log ") {
			message := strings.TrimPrefix(text, "/log ")
			if message == "" {
				msg := tgbotapi.NewMessage(update.Message.Chat.ID, "Usage: /log <your message here>")
				bot.Send(msg)
				continue
			}

			if err := postLog(repoPath, message, loc); err != nil {
				errMsg := tgbotapi.NewMessage(update.Message.Chat.ID, fmt.Sprintf("Error: %v", err))
				bot.Send(errMsg)
				log.Printf("Failed to post log: %v", err)
				continue
			}

			// Extract timestamp from message for confirmation
			ts := time.Now().In(loc).Format("2006-01-02_1504")
			confirmMsg := tgbotapi.NewMessage(update.Message.Chat.ID, fmt.Sprintf("Posted: %s", ts))
			bot.Send(confirmMsg)
			continue
		}

		// Unknown command
		if strings.HasPrefix(text, "/") {
			msg := tgbotapi.NewMessage(update.Message.Chat.ID, "Unknown command. Use /log <message> to post a log.")
			bot.Send(msg)
		}
	}
}

func postLog(repoPath, message string, loc *time.Location) error {
	// git pull --rebase
	if err := runGit(repoPath, "pull", "--rebase"); err != nil {
		return fmt.Errorf("git pull failed: %w", err)
	}

	// Generate timestamp
	now := time.Now().In(loc)
	timestamp := now.Format("2006-01-02_1504")
	slug := timestamp

	// Check for collision and handle
	filePath := filepath.Join(repoPath, "content", "log", fmt.Sprintf("%s.md", slug))
	if _, err := os.Stat(filePath); err == nil {
		// File exists, append unix timestamp
		slug = fmt.Sprintf("%s-%d", timestamp, now.Unix())
		filePath = filepath.Join(repoPath, "content", "log", fmt.Sprintf("%s.md", slug))
	}

	// Generate front matter
	dateStr := now.Format("2006-01-02T15:04:05-03:00")
	content := fmt.Sprintf(`---
title: "%s"
date: %s
draft: false
---

%s
`, timestamp, dateStr, message)

	// Write file
	if err := os.WriteFile(filePath, []byte(content), 0644); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	// git add
	if err := runGit(repoPath, "add", filepath.Join("content", "log", fmt.Sprintf("%s.md", slug))); err != nil {
		return fmt.Errorf("git add failed: %w", err)
	}

	// git commit
	if err := runGit(repoPath, "commit", "-m", fmt.Sprintf("log: %s", timestamp)); err != nil {
		return fmt.Errorf("git commit failed: %w", err)
	}

	// git push
	if err := runGit(repoPath, "push"); err != nil {
		return fmt.Errorf("git push failed: %w", err)
	}

	return nil
}

func runGit(repoPath string, args ...string) error {
	cmd := exec.Command("git", args...)
	cmd.Dir = repoPath
	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("git %v failed: %s", args, string(out))
		return fmt.Errorf("%s", string(out))
	}
	log.Printf("git %v: %s", args, string(out))
	return nil
}
