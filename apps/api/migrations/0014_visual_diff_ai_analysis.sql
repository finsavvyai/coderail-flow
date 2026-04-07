-- D1 migration 0014: add AI analysis column to visual_diff

ALTER TABLE visual_diff ADD COLUMN ai_analysis TEXT;
