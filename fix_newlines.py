import re

with open('e:/Software/RailPulse/WebOne/backend_webbone/public/taipei/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove double newlines
text = re.sub(r'\n\n+', '\n', text)

with open('e:/Software/RailPulse/WebOne/backend_webbone/public/taipei/app.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Newlines fixed")
