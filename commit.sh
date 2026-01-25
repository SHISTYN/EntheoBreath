#!/bin/bash
git add .
git commit -m "fix(ui): mobile layout adjustments
- Add pb-safe to bottom controls and sidebar button to respect iOS Home Indicator
- Add pb-32 to timer view scroll container to prevent content occlusion
- Fix timers sticking to bottom on mobile"
git push origin main
