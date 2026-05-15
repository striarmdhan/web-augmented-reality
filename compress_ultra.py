import os
import subprocess
from pathlib import Path

def compress_video_ultra(input_path, output_path):
    """
    Kompres video dengan pengaturan yang lebih agresif untuk mengurangi ukuran file
    - Bitrate lebih rendah
    - Resolusi dikurangi jika terlalu besar
    - Frame rate dioptimalkan
    """
    try:
        # Cek apakah file input ada
        if not os.path.exists(input_path):
            print(f"File tidak ditemukan: {input_path}")
            return False
        
        # Pengaturan kompresi ultra
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-c:v', 'libx264',  # Codec H.264
            '-crf', '30',  # Constant Rate Factor (23 default, 30 = lebih kecil)
            '-preset', 'slow',  # Preset slow untuk kompresi lebih baik
            '-vf', 'scale=iw*0.75:ih*0.75',  # Kurangi resolusi 25%
            '-r', '24',  # Frame rate 24fps
            '-c:a', 'aac',  # Audio codec
            '-b:a', '96k',  # Audio bitrate rendah
            '-movflags', '+faststart',  # Optimasi untuk streaming
            '-y',  # Overwrite output
            output_path
        ]
        
        # Tampilkan nama file yang sedang dikerjakan
        print(f"Mengompres: {os.path.basename(input_path)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            # Bandingkan ukuran file
            original_size = os.path.getsize(input_path) / (1024 * 1024)  # MB
            compressed_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
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
    # Folder input dan output
    input_folder = "raw"
    output_folder = "compressed_ultra"
    
    # Dapatkan semua file video
    video_extensions = ['.mp4', '.MP4', '.avi', '.mov', '.mkv']
    
    # List untuk menyimpan pasangan (input_path, output_path)
    video_tasks = []
    
    # Menggunakan os.walk untuk menelusuri folder dan sub-foldernya secara otomatis
    for root, dirs, files in os.walk(input_folder):
        for file in files:
            if any(file.endswith(ext) for ext in video_extensions):
                # 1. Dapatkan lokasi asli file
                input_path = os.path.join(root, file)
                
                # 2. Cari tahu struktur folder relatifnya (misal: bagian2/part1/video1.mp4)
                rel_path = os.path.relpath(input_path, input_folder)
                
                # 3. Tentukan lokasi akhir file
                output_path = os.path.join(output_folder, rel_path)
                
                # Masukkan ke daftar tugas
                video_tasks.append((input_path, output_path))
    
    if not video_tasks:
        print(f"Tidak ada file video ditemukan di dalam folder '{input_folder}' atau sub-foldernya.")
        return
    
    print(f"Ditemukan {len(video_tasks)} file video untuk dikompres\n")
    print("=" * 60)
    
    success_count = 0
    failed_count = 0
    
    for i, (input_path, output_path) in enumerate(video_tasks, 1):
        # Tampilkan path yang lebih jelas di terminal
        rel_display = os.path.relpath(input_path, input_folder)
        print(f"\n[{i}/{len(video_tasks)}] Processing: {rel_display}")
        print("-" * 60)
        
        # 4. BUAT SUB-FOLDER SECARA OTOMATIS jika belum ada
        output_dir = os.path.dirname(output_path)
        os.makedirs(output_dir, exist_ok=True)
        
        # Jalankan kompresi
        if compress_video_ultra(input_path, output_path):
            success_count += 1
        else:
            failed_count += 1
    
    # Summary
    print("\n" + "=" * 60)
    print("RINGKASAN KOMPRESI")
    print("=" * 60)
    print(f"Total file: {len(video_tasks)}")
    print(f"Berhasil: {success_count}")
    print(f"Gagal: {failed_count}")
    print(f"\nFile hasil kompresi disimpan dengan struktur rapi di folder: {output_folder}")

if __name__ == "__main__":
    print("=" * 60)
    print("KOMPRESI VIDEO ULTRA - Support Sub-Folder")
    print("=" * 60)
    print("\nPengaturan:")
    print("- CRF: 30 (kualitas sedang-rendah)")
    print("- Resolusi: 75% dari asli")
    print("- Frame rate: 24 fps")
    print("- Audio bitrate: 96k")
    print("\n")
    
    main()