#!/usr/bin/env python3
import re

# Read the file
with open('src/pages/Reservations.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove showForm state (around line 16)
new_lines = []
for line in lines:
    if 'const [showForm, setShowForm] = useState(false);' not in line:
        new_lines.append(line)

lines = new_lines

# Find the conditional block and remove it
in_conditional = False
conditional_start = -1
kept_content_start = -1
brace_depth = 0

for i, line in enumerate(lines):
    if '{showForm ? (' in line:
        in_conditional = True
        conditional_start = i
        # Don't add this line
        continue
    elif in_conditional and '<NewOrderForm' in line:
        # Skip the NewOrderForm line
        continue
    elif in_conditional and ') : (' in line:
        # This marks the start of the content we want to keep
        kept_content_start = i + 1
        in_conditional = False
        continue
    
# Now rewrite without the conditional
final_lines = []
skip_until = -1

for i, line in enumerate(lines):
    # Skip the showForm conditional line
    if conditional_start >= 0 and i == conditional_start:
        continue
    # Skip the NewOrderForm line
    if conditional_start >= 0 and i == conditional_start + 1:
        continue
    # Skip the ) : ( line
    if conditional_start >= 0 and i == conditional_start + 2:
        continue
    # Check if this is near the end and has )}
    if i > len(lines) - 10 and line.strip() == ')}':
        # Skip one instance of )}
        conditional_start = -1  # Reset so we don't skip more
        continue
    
    final_lines.append(line)

# Write the file
with open('src/pages/Reservations.tsx', 'w', encoding='utf-8') as f:
    f.writelines(final_lines)

print(f"Fixed! Removed showForm conditional from {len(lines)} to {len(final_lines)} lines")
