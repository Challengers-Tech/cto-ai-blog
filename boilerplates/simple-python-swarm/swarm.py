import os
import json
from typing import List, Dict, Any, Optional

class Agent:
    """
    Represents an autonomous agent in the swarm.
    """
    def __init__(self, name: str, role: str, instructions: str):
        self.name = name
        self.role = role
        self.instructions = instructions

    def __repr__(self):
        return f"Agent(name='{self.name}', role='{self.role}')"

class Swarm:
    """
    A lightweight orchestrator for multi-agent coordination.
    """
    def __init__(self):
        self.agents: Dict[str, Agent] = {}
        self.messages: List[Dict[str, str]] = []

    def add_agent(self, agent: Agent):
        self.agents[agent.name] = agent

    def chat(self, agent_name: str, message: str) -> str:
        """
        Simulates a conversation with a specific agent.
        In a production environment, this would call an LLM (e.g., OpenAI, Anthropic).
        """
        if agent_name not in self.agents:
            raise ValueError(f"Agent '{agent_name}' not found in swarm.")

        agent = self.agents[agent_name]
        print(f"[{agent.name}] processing: {message[:50]}...")
        
        # Mocking LLM response
        response = f"Response from {agent.name} ({agent.role}): I have processed your request based on my instructions: '{agent.instructions[:30]}...'"
        
        self.messages.append({"role": "user", "content": message})
        self.messages.append({"role": "assistant", "name": agent_name, "content": response})
        
        return response

def main():
    # 1. Initialize the Swarm
    swarm = Swarm()

    # 2. Define Agents
    researcher = Agent(
        name="Researcher",
        role="Market Analyst",
        instructions="Analyze market trends and provide data-driven insights."
    )
    
    writer = Agent(
        name="Writer",
        role="Copywriter",
        instructions="Take research data and turn it into engaging blog posts."
    )

    # 3. Add Agents to Swarm
    swarm.add_agent(researcher)
    swarm.add_agent(writer)

    # 4. Execute a simple workflow
    print("--- Swarm Workflow Started ---")
    research_query = "What are the top 3 AI trends in 2024?"
    research_result = swarm.chat("Researcher", research_query)
    
    write_request = f"Write a tweet based on this research: {research_result}"
    final_output = swarm.chat("Writer", write_request)

    print("\n--- Final Swarm Output ---")
    print(final_output)

if __name__ == "__main__":
    main()
