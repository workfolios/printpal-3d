#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

node -e "const major=Number(process.versions.node.split('.')[0]); if (major < 22) { console.error('PrintPal Codespaces requires Node.js 22+.'); process.exit(1); } console.log('Node runtime:', process.version);"

npm ci --no-audit --no-fund
npm run check

echo
echo "PrintPal 3D full runtime prepared successfully."
echo "For Gemini-assisted routes, configure the Codespaces repository secret GEMINI_API_KEY."
echo "Without that secret, the application remains usable through labeled Standard Guidance fallback."
