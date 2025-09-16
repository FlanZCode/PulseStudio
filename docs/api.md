## Health
GET /health → 200 { status, uptime }

## Process
POST /processes/:id/start|stop|restart
GET /processes/:id/logs?tail=100

## Files
GET /files?path=
POST /files/upload
DELETE /files?path=

## Auth
Authorization: Bearer <token>