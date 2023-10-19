.PHONY: all install lint format build

all: install lint format build

install:
	npm install

lint:
	npm run lint

format:
	npm run format

build:
	npm run build
