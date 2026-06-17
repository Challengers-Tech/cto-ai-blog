# Swarms.Guide Boilerplates

This directory contains production-ready boilerplates and tools for building and managing AI agent swarms.

## Contents

- `simple-python-swarm/`: A lightweight, dependency-free boilerplate for building multi-agent swarms in Python.
- `topic_suggestor.py`: A script that fetches AI agent trends and generates high-engagement topic ideas for Swarms.Guide.
- `content_scheduler.py`: A tool to schedule topic ideas and manage the publication queue in `schedule.json`.

## Usage

### Topic Suggestor
Generates 3 fresh topic ideas based on current trends.
```bash
python3 topic_suggestor.py
```
This will create `suggested_topics.json`.

### Content Scheduler
Schedules the generated topics for future publication.
```bash
python3 content_scheduler.py
```
This updates `/home/team/shared/schedule.json`.
