import http.server
import socketserver
import urllib.request
import urllib.parse
import os

PORT = int(os.environ.get('PORT', 8080))

BASE = os.path.dirname(os.path.abspath(__file__))

MIME = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
    '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png',
    '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff',
    '.wav': 'audio/wav', '.json': 'application/json', '.riv': 'application/octet-stream',
    '.mp4': 'video/mp4', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm',
    '.hdr': 'application/octet-stream', '.ktx2': 'image/ktx2',
}

def guess_mime(path):
    return MIME.get(os.path.splitext(path)[1].lower(), 'application/octet-stream')

class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(fmt % args)

    def serve_file(self, abs_path):
        try:
            with open(abs_path, 'rb') as f:
                data = f.read()
            self.send_response(200)
            self.send_header('Content-Type', guess_mime(abs_path))
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_error(500, str(e))

    def proxy_or_404(self, url_path):
        url = f"https://mnemosyne.itsalien.io{url_path}"
        local = os.path.join(BASE, 'home', url_path.lstrip('/'))
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'Referer': 'https://mnemosyne.io/',
                'Origin': 'https://mnemosyne.io/'
            })
            with urllib.request.urlopen(req) as resp:
                data = resp.read()
                os.makedirs(os.path.dirname(local), exist_ok=True)
                with open(local, 'wb') as f:
                    f.write(data)
                self.send_response(200)
                self.send_header('Content-Type', resp.headers.get_content_type())
                self.send_header('Content-Length', str(len(data)))
                self.end_headers()
                self.wfile.write(data)
        except Exception as e:
            print(f"Proxy error {url_path}: {e}")
            self.send_error(404)

    def do_GET(self):
        path = urllib.parse.unquote(self.path.split('?')[0])

        if path in ('/', '/index.html', ''):
            self.serve_file(os.path.join(BASE, 'home', 'index.html'))
            return

        if path in ('/gate', '/gate/', '/gate/index.html'):
            self.serve_file(os.path.join(BASE, 'terminal', 'index.html'))
            return

        home_local = os.path.join(BASE, 'home', path.lstrip('/'))
        if os.path.isfile(home_local):
            self.serve_file(home_local)
            return

        terminal_local = os.path.join(BASE, 'terminal', path.lstrip('/'))
        if os.path.isfile(terminal_local):
            self.serve_file(terminal_local)
            return

        root_local = os.path.join(BASE, path.lstrip('/'))
        if os.path.isfile(root_local):
            self.serve_file(root_local)
            return

        self.proxy_or_404(path)

class ThreadingServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

with ThreadingServer(("", PORT), Handler) as httpd:
    print(f"Serving at http://0.0.0.0:{PORT}", flush=True)
    httpd.serve_forever()
