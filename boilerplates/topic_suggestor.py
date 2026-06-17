import json
import random

# Mocking trending topics from AI agent space
TRENDING_SOURCES = [
    "OpenAI releases Swarm framework for lightweight agent orchestration.",
    "Anthropic introduces Computer Use capability for Claude.",
    "Multi-agent systems (MAS) seen as next step in LLM evolution.",
    "Autonomous agents for sales automation on the rise.",
    "Hugging Face SmolAgents: a new way to build small but mighty agents.",
    "The rise of Agentic Workflow: moving from single prompts to loops.",
]

def fetch_trending_topics():
    """
    Simulates fetching trending AI agent topics.
    """
    print("[TopicSuggestor] Fetching latest AI trends...")
    return random.sample(TRENDING_SOURCES, 3)

def generate_topic_ideas(trends):
    """
    Simulates an LLM call to process trends into Swarms.Guide topic ideas.
    Swarms.Guide mission: Transitioning founders from chatting to swarms.
    """
    print("[TopicSuggestor] Processing trends with simulated LLM...")
    
    # In a real scenario, this would be an OpenAI/Anthropic API call.
    # We simulate high-engagement topics aligned with the mission.
    topic_ideas = []
    
    # Mapping trends to specific Swarms.Guide angles
    angles = [
        "From Chat to Swarm: Scaling your first agent workflow.",
        "The Solo Founder's Guide to Multi-Agent Systems.",
        "Automating Sales Swarms: Why one agent isn't enough.",
        "Lightweight Swarms: Deploying autonomous loops for SMBs.",
        "Beyond Prompting: Building your first agentic loop."
    ]
    
    selected_angles = random.sample(angles, 3)
    
    for i, angle in enumerate(selected_angles):
        topic_ideas.append({
            "id": f"topic-{i+1}",
            "title": angle,
            "context": f"Based on trend: {trends[i]}",
            "mission_alignment": "High"
        })
        
    return topic_ideas

def main():
    print("--- Swarms.Guide Topic Suggestor ---")
    trends = fetch_trending_topics()
    ideas = generate_topic_ideas(trends)
    
    print("\n[TopicSuggestor] Suggested Topics:")
    for idea in ideas:
        print(f"- {idea['title']} (Context: {idea['context']})")

    # Optionally save to a temporary file for the scheduler
    with open("suggested_topics.json", "w") as f:
        json.dump(ideas, f, indent=4)
    print("\n[TopicSuggestor] Suggestions saved to suggested_topics.json")

if __name__ == "__main__":
    main()
