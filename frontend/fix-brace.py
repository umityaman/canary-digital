#!/usr/bin/env python3

# Read the file
with open('src/pages/Reservations.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and fix the problematic line
for i, line in enumerate(lines):
    # Line 291 should have just {
    if i == 290 and line.strip() == '{':  # Line 291 (0-indexed as 290)
        lines[i] = ''  # Remove this line entirely
        break

# Write the file
with open('src/pages/Reservations.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Removed leftover brace at line 291!")
