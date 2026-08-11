import requests

api_key = '$2a$10$VTKrChWi/xQAssnzQndoseXK06UdJQ1HSuL/qVxkhIA/SWvvo3uvu'
url = 'https://api.jsonbin.io/v3/b'

headers = {
    'Content-Type': 'application/json',
    'X-Master-Key': api_key
}

data = {'test': True}

response = requests.post(url, json=data, headers=headers)
print(f'Status: {response.status_code}')
print(f'Response: {response.text}')
