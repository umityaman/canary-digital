#!/usr/bin/env python3
import re

# Read the file
with open('src/pages/Reservations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove showForm state declaration
content = re.sub(r'  const \[showForm, setShowForm\] = useState\(false\);\n', '', content)

# Remove the conditional part - more carefully
# Find the pattern: {showForm ? ( ... ) : (
# and replace with just the content after the :
pattern = r'\{showForm \? \(\s*<NewOrderForm onClose=\{\(\) => setShowForm\(false\)\} />\s*\) : \('
replacement = '{'

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Now remove the extra closing )}
content = re.sub(r'(\s+</div>\s+</div>\s+</div>\s+)\)\}(\s+</div>\s+</div>\s+</div>)', r'\1\2', content)

# Write the file
with open('src/pages/Reservations.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed showForm conditional!")
