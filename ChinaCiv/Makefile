PNPM ?= corepack pnpm

.PHONY: setup dev build preview test test-all bench

setup:
	$(PNPM) install --frozen-lockfile

dev:
	$(PNPM) dev

build:
	$(PNPM) build

preview:
	$(PNPM) preview

test:
	$(PNPM) test

test-all: test build
	$(PNPM) test:e2e

bench:
	$(PNPM) bench
