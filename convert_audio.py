import os
import subprocess

def convert_to_mp3(input_folder, output_folder):
    # Buat folder output jika belum ada (sekalian otomatis bikin struktur foldernya)
    os.makedirs(output_folder, exist_ok=True)
    
    # Cek apakah folder input ada
    if not os.path.exists(input_folder):
        print(f"Folder input tidak ditemukan: {input_folder}")
        return

    # Cari file audio (mendukung .mpeg, .m4a, .wav, dsb)
    valid_extensions = ['.mpeg', '.mpg', '.mp4', '.m4a', '.wav', '.ogg']
    audio_files = [f for f in os.listdir(input_folder) if os.path.splitext(f)[1].lower() in valid_extensions]

    if not audio_files:
        print(f"Tidak ada file audio yang didukung ditemukan di '{input_folder}'")
        return

    print(f"Ditemukan {len(audio_files)} file audio untuk dikonversi.\n")
    print("=" * 60)

    success_count = 0
    failed_count = 0

    for i, filename in enumerate(audio_files, 1):
        input_path = os.path.join(input_folder, filename)
        
        # Ambil nama file asli, lalu ganti ekstensinya jadi .MP3
        name_without_ext = os.path.splitext(filename)[0]
        output_filename = f"{name_without_ext}.MP3"
        output_path = os.path.join(output_folder, output_filename)

        print(f"\n[{i}/{len(audio_files)}] Mengonversi: {filename}")
        print(f"  -> Menjadi: {output_filename}")

        # Command FFmpeg untuk ekstrak dan konversi ke MP3 High Quality
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-q:a', '2',  # Kualitas audio VBR Tinggi (setara 190 kbps, sangat jernih)
            '-map', 'a',  # Pastikan HANYA mengambil audionya saja (jika file mpeg ada videonya)
            '-y',         # Timpa (overwrite) file jika di folder output sudah ada file yg sama
            output_path
        ]

        try:
            # Jalankan perintah tanpa memunculkan teks FFmpeg yang panjang
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("  ✓ Berhasil!")
                success_count += 1
            else:
                print("  ✗ Gagal!")
                print(f"    Error: {result.stderr}")
                failed_count += 1
        except Exception as e:
            print(f"  ✗ Error sistem: {e}")
            failed_count += 1

    # Tampilkan Kesimpulan
    print("\n" + "=" * 60)
    print("RINGKASAN KONVERSI AUDIO")
    print("=" * 60)
    print(f"Total diproses : {len(audio_files)}")
    print(f"Berhasil       : {success_count}")
    print(f"Gagal          : {failed_count}")
    print(f"\nFile MP3 kamu siap digunakan di: {output_folder}")

if __name__ == "__main__":
    print("=" * 60)
    print("KONVERTER AUDIO OTOMATIS (MPEG ke MP3)")
    print("=" * 60)
    
    # Sesuaikan dengan target foldermu
    INPUT_DIR = "sounds/bagian2/raw-sounds"
    OUTPUT_DIR = "sounds/bagian2/output-sounds"
    
    convert_to_mp3(INPUT_DIR, OUTPUT_DIR)