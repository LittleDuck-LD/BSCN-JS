import sys

def decrypt_file(encrypted_path, output_path):
    with open(encrypted_path, 'rb') as f:
        data = f.read()
    
    # 检查魔数头
    if not data.startswith(b'_ENCRYPT'):
        raise ValueError("无效文件头 (缺少 '_ENCRYPT')")
    
    # 跳过8字节魔数头
    encrypted_data = data[8:]
    if not encrypted_data:
        raise ValueError("文件内容过短")
    
    # 提取IV（第一个字节）
    iv = encrypted_data[0]
    
    # 解密数据（从第二个字节开始）
    plaintext = bytearray()
    for position, byte in enumerate(encrypted_data[1:]):
        # 密钥流生成算法
        key = (iv + position * 5) % 256
        plaintext.append(byte ^ key)
    
    # 写入输出文件
    with open(output_path, 'wb') as f:
        f.write(plaintext)
    print(f"文件解密成功: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("用法: python decrypt.py <加密文件> <输出文件>")
        sys.exit(1)
    
    encrypted_file = sys.argv[1]
    output_file = sys.argv[2]
    decrypt_file(encrypted_file, output_file)
