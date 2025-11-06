from huggingface_hub import snapshot_download
import os

target_dir = r"D:\law\models\InLegalLLaMA"

print("🔁 Retrying model download...")
snapshot_download(
    repo_id="sudipto-ducs/InLegalLLaMA",
    local_dir=target_dir,
    force_download=True,    # forces re-download of incomplete files
    resume_download=True,   # resumes from partial files if possible
)
print("✅ Download complete at:", target_dir)
