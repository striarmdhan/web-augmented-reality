import os
import subprocess

def compress_video_ultra(input_path, output_path):
    """
    Kompres video dengan pengaturan agresif khusus Web AR:
    - Resolusi dipaksa ke 960x960
    - Audio dihapus total untuk meringankan RAM
    - Frame rate diturunkan ke 24fps
    """
    try:
        if not os.path.exists(input_path):
            print(f"File tidak ditemukan: {input_path}")
            return False
        
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-c:v', 'libx264',          # Codec H.264 (Aman untuk semua browser)
            '-crf', '30',               # Kompresi tinggi (File kecil)
            '-preset', 'slow',          # Kualitas kompresi rapi
            '-vf', 'scale=960:960',     # ANTI-WHITESCREEN: Pangkas resolusi raksasa!
            '-r', '24',                 # Turunkan frame rate agar enteng
            '-an',                      # ANTI-DESYNC: Buang total pita suara agar RAM HP lega!
            '-movflags', '+faststart',  # Optimasi agar video AR langsung muncul
            '-y',                       # Timpa file jika sudah ada
            output_path
        ]
        
        print(f"Mengompres: {os.path.basename(input_path)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            original_size = os.path.getsize(input_path) / (1024 * 1024)
            compressed_size = os.path.getsize(output_path) / (1024 * 1024)
            reduction = ((original_size - compressed_size) / original_size) * 100
            
            print(f"✓ Berhasil: {os.path.basename(output_path)}")
            print(f"  Ukuran asli: {original_size:.2f} MB")
            print(f"  Ukuran baru: {compressed_size:.2f} MB")
            print(f"  Pengurangan: {reduction:.1f}%\n")
            return True
        else:
            print(f"✗ Gagal mengompres: {os.path.basename(input_path)}")
            print(f"  Error: {result.stderr}\n")
            return False
            
    except Exception as e:
        print(f"✗ Error: {str(e)}\n")
        return False

def main():
    print("=" * 60)
    print("🎯 KOMPRESI VIDEO AR - CUSTOM FOLDER")
    print("=" * 60)
    
    # 1. Meminta input dari pengguna secara interaktif
    print("\nMasukkan lokasi folder yang ingin dikompres!")
    input_folder = input("Folder Sumber (contoh: raw-videos/chapter2/part2) : ").strip()
    
    if not os.path.exists(input_folder):
        print(f"\n❌ ERROR: Folder sumber '{input_folder}' tidak ditemukan!")
        return

    output_folder = input("Folder Tujuan (contoh: compressed_ultra-videos/chapter2/part2) : ").strip()
    
    if not input_folder or not output_folder:
        print("\n❌ Path tidak boleh kosong! Dibatalkan.")
        return

    video_extensions = ['.mp4', '.MP4', '.avi', '.mov', '.mkv']
    video_tasks = []
    
    for root, dirs, files in os.walk(input_folder):
        for file in files:
            if any(file.endswith(ext) for ext in video_extensions):
                input_path = os.path.join(root, file)
                rel_path = os.path.relpath(input_path, input_folder)
                base_name = os.path.splitext(rel_path)[0] 
                output_path = os.path.join(output_folder, base_name + '.mp4')
                video_tasks.append((input_path, output_path))
    
    if not video_tasks:
        print(f"\n⚠️ Tidak ada file video ditemukan di dalam folder '{input_folder}'.")
        return
    
    print(f"\nDitemukan {len(video_tasks)} file video untuk dikompres")
    print("=" * 60)
    
    success_count = 0
    failed_count = 0
    
    for i, (input_path, output_path) in enumerate(video_tasks, 1):
        rel_display = os.path.relpath(input_path, input_folder)
        print(f"\n[{i}/{len(video_tasks)}] Processing: {rel_display}")
        print("-" * 60)
        
        output_dir = os.path.dirname(output_path)
        os.makedirs(output_dir, exist_ok=True)
        
        if compress_video_ultra(input_path, output_path):
            success_count += 1
        else:
            failed_count += 1
    
    print("\n" + "=" * 60)
    print("RINGKASAN KOMPRESI")
    print("=" * 60)
    print(f"Total file: {len(video_tasks)}")
    print(f"Berhasil:   {success_count}")
    print(f"Gagal:      {failed_count}")
    print(f"\n✅ Selesai! File disimpan di: {output_folder}")

if __name__ == "__main__":
    print("=" * 60)
    print("🔥 PENGATURAN KOMPRESI (WEB AR OPTIMIZED)")
    print("- CRF: 30 (Ukuran super kecil)")
    print("- Resolusi: Dipaksa ke 960x960")
    print("- Frame rate: 24 fps")
    print("- Audio: Dihapus total (-an)")
    print("=" * 60)
    
    main()