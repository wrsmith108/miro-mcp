#!/bin/bash

# Miro Board Product Discovery Implementation Swarm
# Using Teresa Torres' Continuous Discovery Habits methodology

echo "🚀 Initializing Product Discovery Board Implementation Swarm"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Set environment variables
export MIRO_ACCESS_TOKEN="eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_J9FguRQ-s5E5GkzQB216o1RYM-o"
export MIRO_BOARD_ID="uXjVJS1vI0k="
export SWARM_CONFIG_PATH="./swarm-config.json"

# Navigate to Miro-MCP project directory
cd /Users/williamsmith/Documents/GitHub/Miro-MCP

echo "📋 Project Directory: $(pwd)"
echo ""

# Initialize Memory for swarm coordination
echo "💾 Initializing swarm memory..."
./claude-flow memory store "swarm_objective" "Implement Teresa Torres Continuous Discovery Habits on Miro board"
./claude-flow memory store "board_id" "$MIRO_BOARD_ID"
./claude-flow memory store "implementation_plan" "/Users/williamsmith/Documents/GitHub/Miro-MCP/claude-organizer/docs/Project/miro-board-implementation-plan.md"
./claude-flow memory store "blank_stickies_count" "197"
./claude-flow memory store "target_fill_rate" "80%"

echo ""
echo "🤖 Spawning specialized agents..."
echo ""

# Spawn Teresa Torres methodology expert
echo "1️⃣ Spawning Teresa_Torres (Methodology Expert)..."
./claude-flow agent spawn researcher --name "Teresa_Torres" &
PID_TERESA=$!
sleep 1

# Spawn Miro API specialist  
echo "2️⃣ Spawning Miro_API (API Integration Specialist)..."
./claude-flow agent spawn coder --name "Miro_API" &
PID_MIRO=$!
sleep 1

# Spawn QA Compliance officer
echo "3️⃣ Spawning QA_Compliance (Quality Assurance)..."
./claude-flow agent spawn tester --name "QA_Compliance" &
PID_QA=$!
sleep 1

# Spawn MCP Server manager
echo "4️⃣ Spawning MCP_Server (Infrastructure Expert)..."
./claude-flow agent spawn coder --name "MCP_Server" &
PID_MCP=$!
sleep 1

# Spawn Content Architect
echo "5️⃣ Spawning Content_Architect (Content Designer)..."
./claude-flow agent spawn architect --name "Content_Architect" &
PID_CONTENT=$!
sleep 1

# Spawn Visual Organizer
echo "6️⃣ Spawning Visual_Organizer (Layout Specialist)..."
./claude-flow agent spawn designer --name "Visual_Organizer" &
PID_VISUAL=$!
sleep 1

# Spawn Data Analyst
echo "7️⃣ Spawning Data_Analyst (Analytics Expert)..."
./claude-flow agent spawn analyzer --name "Data_Analyst" &
PID_DATA=$!
sleep 1

# Spawn Orchestrator
echo "8️⃣ Spawning Orchestrator (Swarm Coordinator)..."
./claude-flow agent spawn swarm-coordinator --name "Orchestrator" &
PID_ORCHESTRATOR=$!
sleep 2

echo ""
echo "✅ All agents spawned successfully!"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎯 SWARM OBJECTIVE:"
echo "Implement Teresa Torres' Continuous Discovery Habits methodology"
echo "on Miro board with Opportunity Solution Tree structure"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Launch the swarm with hierarchical coordination
echo "🚀 Launching coordinated swarm execution..."
echo ""

./claude-flow swarm "Implement Teresa Torres product discovery methodology on Miro board ID $MIRO_BOARD_ID following the implementation plan at /Users/williamsmith/Documents/GitHub/Miro-MCP/claude-organizer/docs/Project/miro-board-implementation-plan.md. Phase 0: Setup framework with PRIMARY OUTCOME at top. Phase 1: Remove 197 blank stickies strategically. Phase 2: Populate opportunities and solutions. Phase 3: Create 30+ parent-child connections. Phase 4: Quality assurance and compliance check. Ensure 80% fill rate and proper color mapping." \
  --strategy development \
  --mode hierarchical \
  --max-agents 8 \
  --parallel \
  --monitor \
  --output json > swarm-execution.log 2>&1 &

SWARM_PID=$!

echo "📊 Swarm execution started (PID: $SWARM_PID)"
echo "📝 Monitoring output at: swarm-execution.log"
echo ""

# Monitor swarm progress
echo "📈 Monitoring swarm progress..."
echo "Press Ctrl+C to stop monitoring (swarm will continue running)"
echo ""
echo "════════════════════════════════════════════════════════════"

# Tail the log file to show real-time progress
tail -f swarm-execution.log | while read line; do
    # Color code different agent outputs
    if [[ $line == *"Teresa_Torres"* ]]; then
        echo -e "\033[0;35m[METHODOLOGY] $line\033[0m"  # Purple for Teresa
    elif [[ $line == *"Miro_API"* ]]; then
        echo -e "\033[0;36m[API] $line\033[0m"  # Cyan for Miro
    elif [[ $line == *"QA_Compliance"* ]]; then
        echo -e "\033[0;31m[QA] $line\033[0m"  # Red for QA
    elif [[ $line == *"MCP_Server"* ]]; then
        echo -e "\033[0;33m[MCP] $line\033[0m"  # Yellow for MCP
    elif [[ $line == *"Content_Architect"* ]]; then
        echo -e "\033[0;32m[CONTENT] $line\033[0m"  # Green for Content
    elif [[ $line == *"Visual_Organizer"* ]]; then
        echo -e "\033[0;34m[VISUAL] $line\033[0m"  # Blue for Visual
    elif [[ $line == *"Data_Analyst"* ]]; then
        echo -e "\033[0;95m[DATA] $line\033[0m"  # Light Purple for Data
    elif [[ $line == *"Orchestrator"* ]]; then
        echo -e "\033[1;37m[ORCHESTRATOR] $line\033[0m"  # Bold White for Orchestrator
    else
        echo "$line"
    fi
done