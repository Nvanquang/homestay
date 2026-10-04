#!/usr/bin/env bash
set -euo pipefail

# 3-Tier Verification Runner for Harness (Linux / macOS / Git Bash)
TARGET="${1:-all}"
TIER="${2:-all}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== [HARNESS VERIFY] Starting verification (Target: $TARGET, Tier: $TIER) ==="

run_step() {
    local desc="$1"
    local dir="$2"
    shift 2
    echo -n "-> $desc..."
    if (cd "$dir" && "$@") > /dev/null 2>&1; then
        echo " [PASSED]"
    else
        echo " [FAILED]"
        echo "[WHAT]: Verification command failed in $dir: $*"
        echo "[WHY]: Compiler error, typing failure, or broken test assertion."
        echo "[HOW TO FIX]: Run '$*' directly inside $dir to inspect output."
        exit 1
    fi
}

# Frontend Checks
if [ "$TARGET" = "fe" ] || [ "$TARGET" = "all" ]; then
    FE_DIR="$ROOT_DIR/frontend"
    if [ "$TIER" = "1" ] || [ "$TIER" = "all" ]; then
        run_step "Frontend Tier 1: Typecheck (tsc)" "$FE_DIR" npx tsc --noEmit
    fi
    if [ "$TIER" = "2" ] || [ "$TIER" = "all" ]; then
        run_step "Frontend Tier 2: Unit Tests (vitest)" "$FE_DIR" npm test
    fi
fi

# Backend Checks
if [ "$TARGET" = "be" ] || [ "$TARGET" = "all" ]; then
    BE_DIR="$ROOT_DIR/backend"
    if [ "$TIER" = "1" ] || [ "$TIER" = "all" ]; then
        run_step "Backend Tier 1: Compile Java" "$BE_DIR" ./gradlew compileJava compileTestJava
    fi
    if [ "$TIER" = "2" ] || [ "$TIER" = "all" ]; then
        run_step "Backend Tier 2: Unit Tests" "$BE_DIR" ./gradlew test
    fi
fi

echo "=== [HARNESS VERIFY] SUCCESS: All verification gates passed ==="
