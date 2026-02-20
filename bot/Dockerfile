FROM golang:1.21-alpine AS builder

WORKDIR /build

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /blog-bot .

FROM alpine:3.19

ENV TZ=America/Argentina/Buenos_Aires

RUN apk add --no-cache git openssh-client ca-certificates tzdata

WORKDIR /app

COPY --from=builder /blog-bot .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
