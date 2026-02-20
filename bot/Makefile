.PHONY: build install clean

build:
	go build -o blog-bot .

install: build
	install -m 755 blog-bot /usr/local/bin/blog-bot

clean:
	rm -f blog-bot
