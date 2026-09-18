from supabase import create_client
import os

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
BUCKET_NAME = "medical-report"

def upload_report_file(contents: bytes, file_path: str, content_type: str) -> str:
    supabase.storage.from_(BUCKET_NAME).upload(
        file_path, contents, {"content-type": content_type}
    )
    return file_path

def get_signed_url(file_path: str, expires_in: int = 3600) -> str:
    result = supabase.storage.from_(BUCKET_NAME).create_signed_url(file_path, expires_in)
    return result["signedURL"]