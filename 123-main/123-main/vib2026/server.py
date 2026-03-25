import http.server
import os
import socketserver
import urllib.parse
import sys


ROOT_DIR = os.path.dirname(__file__)
INDEX_HTML_PATH = os.path.join(ROOT_DIR, "index.html")


class SPARequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    Serve static files normally, but when a route like /admin is requested
    and no physical file exists, fall back to index.html (SPA history fallback).
    """

    def translate_path(self, path):  # noqa: N802
        # Force all file lookups to be relative to vib2026/ regardless of cwd.
        parsed = urllib.parse.urlparse(path)
        req_path = parsed.path
        # Use base implementation to sanitize the path, then re-root it.
        rel = req_path.lstrip("/")
        rel = rel.replace("/", os.sep)
        # Prevent escaping ROOT_DIR
        rel = os.path.normpath(rel)
        if rel.startswith(".."):
            rel = ""
        return os.path.join(ROOT_DIR, rel)

    def do_GET(self):  # noqa: N802 (keep http.server signature)
        parsed = urllib.parse.urlparse(self.path)
        req_path = parsed.path

        # Default document.
        if req_path in ("", "/"):
            return self._serve_index()

        # Physical file?
        fs_path = self.translate_path(req_path)
        if os.path.exists(fs_path) and not os.path.isdir(fs_path):
            return super().do_GET()

        # SPA fallback: return index.html for unknown paths.
        return self._serve_index()

    def _serve_index(self):
        try:
            with open(INDEX_HTML_PATH, "rb") as f:
                content = f.read()
        except OSError:
            # If index.html is missing, let default behavior run.
            self.send_error(404, "index.html not found")
            return

        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(content)


def main():
    port = int(os.environ.get("PORT", "5173"))
    if len(sys.argv) >= 2 and sys.argv[1].strip():
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    handler = SPARequestHandler

    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"Serving SPA on http://localhost:{port}")
        httpd.serve_forever()


if __name__ == "__main__":
    main()

