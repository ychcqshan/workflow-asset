import sys
import xml.etree.ElementTree as ET
import re

def extract_chinese(text):
    return re.findall(r'[\u4e00-\u9fff]+', text)

def find_labels(file_path):
    print(f"--- {file_path} ---")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            names = re.findall(r'name="([^"]*[\u4e00-\u9fff]+[^"]*)"', content)
            names = list(set(names))
            for name in names:
                print(name)
            
            # also find text content inside tags
            tag_texts = re.findall(r'>([^<]*[\u4e00-\u9fff]+[^<]*)<', content)
            tag_texts = list(set(tag_texts))
            for text in tag_texts:
                if text.strip() not in names:
                    print("TAG TEXT:", text.strip())
    except Exception as e:
        print(f"Error reading {file_path}: {e}")

if __name__ == "__main__":
    for file_path in sys.argv[1:]:
        find_labels(file_path)
