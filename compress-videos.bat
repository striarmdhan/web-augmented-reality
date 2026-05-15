@echo off
echo ========================================
echo VIDEO COMPRESSION SCRIPT
echo Target: Reduce file size by 70-80%%
echo ========================================
echo.

REM Check if FFmpeg is installed
where ffmpeg >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: FFmpeg not found!
    echo Please install FFmpeg first:
    echo https://ffmpeg.org/download.html
    pause
    exit /b 1
)

echo FFmpeg found! Starting compression...
echo.

REM Create output folder
if not exist "compressed" mkdir compressed

echo [1/5] Compressing LAUT.mp4...
ffmpeg -i "LAUT.mp4" -vcodec h264 -crf 28 -preset fast -vf scale=1280:720 -an "compressed/LAUT.mp4" -y
echo.

echo [2/5] Compressing KAPAL SELAM.mp4...
ffmpeg -i "KAPAL SELAM.mp4" -vcodec h264 -crf 28 -preset fast -vf scale=1280:720 -an "compressed/KAPAL SELAM.mp4" -y
echo.

echo [3/5] Compressing MASCOT.mp4...
ffmpeg -i "MASCOT.mp4" -vcodec h264 -crf 28 -preset fast -vf scale=1280:720 -an "compressed/MASCOT.mp4" -y
echo.

echo [4/5] Compressing BATU SEAWEED.mp4...
ffmpeg -i "BATU SEAWEED.mp4" -vcodec h264 -crf 28 -preset fast -vf scale=1280:720 -an "compressed/BATU SEAWEED.mp4" -y
echo.

echo [5/5] Compressing GELEMBUNG.mp4...
ffmpeg -i "GELEMBUNG.mp4" -vcodec h264 -crf 28 -preset fast -vf scale=1280:720 -an "compressed/GELEMBUNG.mp4" -y
echo.

echo ========================================
echo COMPRESSION COMPLETE!
echo ========================================
echo.
echo Original files are in current folder
echo Compressed files are in "compressed" folder
echo.
echo File size comparison:
dir "LAUT.mp4" "KAPAL SELAM.mp4" "MASCOT.mp4" "BATU SEAWEED.mp4" "GELEMBUNG.mp4" | find "mp4"
echo.
echo Compressed:
dir "compressed\*.mp4" | find "mp4"
echo.
pause
