#!/bin/bash

# Miro Board Teresa Torres Implementation Swarm
echo "🎯 Teresa Torres Miro Board Implementation Swarm"
echo "══════════════════════════════════════════════════════════════"
echo ""

# Environment setup
export MIRO_ACCESS_TOKEN="eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_J9FguRQ-s5E5GkzQB216o1RYM-o"
export MIRO_BOARD_ID="uXjVJS1vI0k="
export IMPLEMENTATION_PLAN="/Users/williamsmith/Documents/GitHub/Miro-MCP/claude-organizer/docs/Project/miro-board-implementation-plan.md"

cd /Users/williamsmith/Documents/GitHub/Miro-MCP

# Stop existing swarms
echo "🛑 Cleaning up existing swarms..."
for session in $(claude-flow hive-mind sessions 2>/dev/null | grep "Session ID:" | awk '{print $3}'); do
    claude-flow hive-mind stop "$session" 2>/dev/null
done

# Initialize hive mind
echo "🧠 Initializing Hive Mind..."
rm -rf .hive-mind 2>/dev/null
claude-flow hive-mind init

# Store data in memory
echo "💾 Loading implementation data..."
claude-flow memory store "miro_board_id" "$MIRO_BOARD_ID"
claude-flow memory store "miro_access_token" "$MIRO_ACCESS_TOKEN"
claude-flow memory store "implementation_plan" "$IMPLEMENTATION_PLAN"
claude-flow memory store "phase_0" "Move PRIMARY OUTCOME to (1400,100)"
claude-flow memory store "phase_1" "Remove 197 blank stickies"
claude-flow memory store "phase_2" "Create Opportunity Solution Tree"
claude-flow memory store "phase_3" "Add 30+ connector arrows"
claude-flow memory store "phase_4" "Verify Teresa Torres compliance"

echo ""
echo "🚀 Spawning MCP-integrated swarm..."

# Spawn swarm
claude-flow hive-mind spawn "Implement Teresa Torres methodology on Miro board $MIRO_BOARD_ID following implementation plan at $IMPLEMENTATION_PLAN" \
  --max-workers 6 \
  --strategy development \
  --mode hierarchical \
  --parallel \
  --monitor \
  > swarm-execution.log 2>&1 &

SWARM_PID=$!
echo "✅ Swarm spawned (PID: $SWARM_PID)"
echo ""

sleep 3
claude-flow hive-mind status | head -20

echo ""
echo "📊 Monitor with: tail -f swarm-execution.log"
echo "🛑 Stop with: claude-flow hive-mind stop [session-id]"
