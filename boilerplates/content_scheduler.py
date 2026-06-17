import json
import os
from datetime import datetime, timedelta

SCHEDULE_FILE = "/home/team/shared/schedule.json"
SUGGESTIONS_FILE = "suggested_topics.json"

def load_suggestions():
    if not os.path.exists(SUGGESTIONS_FILE):
        print(f"[ContentScheduler] No suggestions found at {SUGGESTIONS_FILE}. Run topic_suggestor.py first.")
        return []
    with open(SUGGESTIONS_FILE, "r") as f:
        return json.load(f)

def load_current_schedule():
    if not os.path.exists(SCHEDULE_FILE):
        return []
    with open(SCHEDULE_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_schedule(schedule):
    with open(SCHEDULE_FILE, "w") as f:
        json.dump(schedule, f, indent=4)
    print(f"[ContentScheduler] Schedule updated at {SCHEDULE_FILE}")

def schedule_topics(topics):
    """
    Schedules topics for publication, starting from next Monday.
    """
    if not topics:
        return
    
    current_schedule = load_current_schedule()
    
    # Calculate starting date (next Monday)
    today = datetime.now()
    days_until_monday = (7 - today.weekday()) % 7
    if days_until_monday == 0: days_until_monday = 7
    start_date = today + timedelta(days=days_until_monday)
    
    print(f"[ContentScheduler] Scheduling {len(topics)} topics starting from {start_date.date()}...")
    
    for i, topic in enumerate(topics):
        pub_date = start_date + timedelta(weeks=i)
        scheduled_item = {
            "title": topic["title"],
            "publish_date": str(pub_date.date()),
            "status": "Scheduled",
            "context": topic.get("context", "")
        }
        current_schedule.append(scheduled_item)
        print(f"  - Scheduled: '{topic['title']}' for {pub_date.date()}")
        
    save_schedule(current_schedule)

def main():
    print("--- Swarms.Guide Content Scheduler ---")
    topics = load_suggestions()
    if topics:
        schedule_topics(topics)
    else:
        print("[ContentScheduler] Nothing to schedule.")

if __name__ == "__main__":
    main()
