import argparse
import asyncio
import os

import aiohttp


async def upload_file(session, url, file_path):
    """Send a single file upload request."""
    try:
        with open(file_path, "rb") as f:
            data = aiohttp.FormData()
            data.add_field("file", f, filename=os.path.basename(file_path))
            async with session.post(url, data=data) as response:
                text = await response.text()
                print(
                    f"{file_path}: [{response.status}] {text[:100]}..."
                )  # print first 100 chars of response
    except Exception as e:
        print(f"Error uploading {file_path}: {e}")


async def main(url, file_paths):
    """Upload multiple files in parallel."""
    async with aiohttp.ClientSession() as session:
        tasks = [upload_file(session, url, path) for path in file_paths]
        await asyncio.gather(*tasks)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload multiple files in parallel.")
    parser.add_argument(
        "url", help="Target server URL (e.g. https://example.com/upload)"
    )
    parser.add_argument("files", nargs="+", help="Paths to the files to upload")
    args = parser.parse_args()

    asyncio.run(main(args.url, args.files))
