#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG="/tmp/printpal-3d.log"
PIDFILE="/tmp/printpal-3d.pid"

cd "$ROOT"

if curl -fsS "http://127.0.0.1:3000/api/runtime-status" >/dev/null 2>&1; then
  echo "PrintPal 3D is already running on port 3000."
  exit 0
fi

if [[ ! -f "dist/server.cjs" ]]; then
  echo "Production build is missing; rebuilding PrintPal 3D..."
  npm run build
fi

if [[ -f "$PIDFILE" ]]; then
  OLD_PID="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [[ -n "$OLD_PID" ]] && kill -0 "$OLD_PID" >/dev/null 2>&1; then
    kill "$OLD_PID" >/dev/null 2>&1 || true
    sleep 1
  fi
  rm -f "$PIDFILE"
fi

: > "$LOG"
nohup env NODE_ENV=production PORT=3000 node dist/server.cjs </dev/null >>"$LOG" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > "$PIDFILE"

echo "Starting PrintPal 3D full runtime (PID $SERVER_PID)..."
for _ in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:3000/api/runtime-status" >/dev/null 2>&1; then
    echo "PrintPal 3D is available on port 3000."
    exit 0
  fi

  if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    echo "PrintPal 3D exited during startup. Log follows:" >&2
    cat "$LOG" >&2 || true
    rm -f "$PIDFILE"
    exit 1
  fi

  sleep 1
done

echo "PrintPal 3D did not become ready within 60 seconds. Check $LOG." >&2
exit 1
