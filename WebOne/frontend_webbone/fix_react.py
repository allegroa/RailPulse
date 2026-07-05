import re
with open('src/pages/DataVizualizer.jsx', 'r', encoding='utf-8') as f:
  code = f.read()
code = code.replace('return (<>', 'return (', 1)
with open('src/pages/DataVizualizer.jsx', 'w', encoding='utf-8') as f:
  f.write(code)
