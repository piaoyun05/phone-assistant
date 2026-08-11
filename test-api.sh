#!/bin/bash
curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "https://api.jsonbin.io/v3/b" \
  -H "Content-Type: application/json" \
  -H 'X-Master-Key: $2a$10$VTKrChWi/xQAssnzQndoseXK06UdJQ1HSuL/qVxkhIA/SWvvo3uvu' \
  -d '{"test": true}'
