import sys

def inspect_file(path):
    print(f"Inspecting {path}")
    try:
        with open(path, 'rb') as f:
            content = f.read(100)
            print(f"Hex: {content.hex(' ')}")
            try:
                print(f"UTF-16LE: {content.decode('utf-16le', errors='replace')[:50]}")
            except: pass
            try:
                print(f"UTF-8: {content.decode('utf-8', errors='replace')[:50]}")
            except: pass
            try:
                print(f"GBK: {content.decode('gbk', errors='replace')[:50]}")
            except: pass
    except Exception as e:
        print(f"Error: {e}")

inspect_file(r"e:\project\workflow-asset\logs\backend.log")
inspect_file(r"e:\project\workflow-asset\logs\frontend.log")
