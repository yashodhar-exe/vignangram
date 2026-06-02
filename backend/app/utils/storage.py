import os
import uuid
from supabase import create_client, Client
from fastapi import UploadFile
from app.core.config import SUPABASE_URL, SUPABASE_KEY

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_file_to_supabase(file: UploadFile, folder: str) -> str:
    """
    Uploads a file to Supabase storage in the specified folder.
    Returns the public URL of the uploaded file.
    """
    # Read file content
    file_bytes = file.file.read()
    
    # Generate unique filename to prevent overwrites
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    path = f"{folder}/{unique_filename}"
    
    # Upload to Supabase Storage
    # The bucket name is 'vignangram-uploads'
    try:
        supabase.storage.from_("vignangram-uploads").upload(
            path=path,
            file=file_bytes,
            file_options={"content-type": file.content_type}
        )
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Supabase upload failed: {str(e)}")
        
    # Get public URL
    public_url = supabase.storage.from_("vignangram-uploads").get_public_url(path)
    
    # Reset file cursor just in case it's read again
    file.file.seek(0)
    
    return public_url
