# Telegram as Operator channel for Bobby

## Status

Accepted

## Context

The Operator (Hezaerd) primarily reaches Bobby from a phone. Eve’s default HTTP
channel is for local/dev and web clients. Eve ships a first-class Telegram
channel with webhook verification, private DMs, attachments, and HITL buttons.

## Decision

Bobby exposes `agent/channels/telegram.ts` for Operator ↔ Bobby chat. Access is
gated by `TELEGRAM_ALLOWED_USER_IDS` (Operator Telegram user id). Clients never
use this channel.

## Consequences

Requires BotFather bot + `TELEGRAM_BOT_TOKEN` + `TELEGRAM_WEBHOOK_SECRET_TOKEN`
on the Vercel project. Webhook URL is
`https://bobby.hezaerd.com/eve/v1/telegram`, registered via
`POST /eve/v1/telegram/ensure-webhook` or the hourly
`register-telegram-webhook` schedule (not only a laptop `setWebhook`).
WhatsApp / native iOS remain out of scope until a second Operator surface is
justified.
