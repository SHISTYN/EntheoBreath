#!/bin/bash
git add .
git commit -m "fix(ui): switch timer controls to flexbox layout
- Remove absolute positioning to prevent overlap with visualizer
- Move controls outside scrollable area to ensure visibility
- Ensure consistent layout on all screen sizes"
git push origin main
