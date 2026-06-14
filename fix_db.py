import os
from pathlib import Path

target_dir = Path('d:/Projects/solo-leveling/backend/app/api/v1')
files_to_fix = ['quests.py', 'inventory.py', 'shop.py', 'user.py', 'jobs.py']

for fname in files_to_fix:
    fpath = target_dir / fname
    if not fpath.exists():
        continue
    content = fpath.read_text(encoding='utf-8')
    if 'ObjectId' not in content:
        content = 'from bson import ObjectId\n' + content
    
    content = content.replace('{"_id": current_user.id}', '{"_id": ObjectId(current_user.id)}')
    fpath.write_text(content, encoding='utf-8')
print('Done!')
