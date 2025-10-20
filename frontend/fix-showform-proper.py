#!/usr/bin/env python3
import re

# Read the file
with open('src/pages/Reservations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Step 1: Remove showForm state declaration
content = re.sub(r'  const \[showForm, setShowForm\] = useState\(false\);\n', '', content)

# Step 2: Find the conditional and replace properly
# Pattern: Find {showForm ? (...NewOrderForm...) : (
# We want to keep everything after the : and before the matching )}
# Let's do this more carefully with a multi-step approach

# First, find the start of the conditional
start_pattern = r'\{showForm \? \(\s*<NewOrderForm[^/]+/>\s*\) : \('
match = re.search(start_pattern, content, re.DOTALL)

if match:
    start_pos = match.start()
    # Find the content after the :
    after_colon_start = match.end()
    
    # Now we need to find the matching )} that closes this conditional
    # We'll count braces to find the right closing
    depth = 1  # We're inside one level after the : (
    pos = after_colon_start
    while depth > 0 and pos < len(content):
        if content[pos:pos+2] == '))' or content[pos:pos+2] == '})'  or content[pos:pos+2] == ')}':
            depth -= 1
            if depth == 0:
                # Found the closing
                end_pos = pos
                break
        elif content[pos] == '(':
            depth += 1
        pos += 1
    
    # Extract the content between : ( and )}
    inner_content = content[after_colon_start:end_pos]
    
    # Remove the conditional wrapper entirely
    # Replace {showForm ? (...) : (CONTENT)} with just CONTENT
    content = content[:start_pos] + inner_content + content[end_pos+2:]

# Write the file
with open('src/pages/Reservations.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed showForm conditional properly!")
