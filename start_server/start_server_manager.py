import argparse
import os
import socket
import subprocess
import sys
import threading
import time
from pathlib import Path
import tkinter as tk
from tkinter import scrolledtext, ttk


class ServerManagerGUI:
    def __init__(self, root):
        self.root = root
        self.project_root = self._resolve_project_root()
        self.profile_var = tk.StringVar(value="adts")
        self.processes = {}
        self.module_widgets = {}
        self.module_states = {}
        self.busy = False
        self._build_module_config()
        self._create_ui()
        self._refresh_ui_state()
        self.root.after(300, self._check_server_state)

    def _resolve_project_root(self):
        base_dir = Path(__file__).resolve().parent
        executable_dir = Path(sys.executable).resolve().parent if getattr(sys, "executable", None) else None
        cwd_dir = Path.cwd().resolve()

        candidates = []
        for candidate in [
            cwd_dir,
            executable_dir,
            base_dir,
            base_dir.parent,
            base_dir.parent.parent,
            Path("E:/Software/RailPulse"),
            Path("E:/Software"),
            Path("E:/"),
        ]:
            if candidate is None:
                continue
            if candidate not in candidates:
                candidates.append(candidate)

        for candidate in candidates:
            if (candidate / "WebOne" / "backend_webbone").exists() or (
                candidate / "WebOne" / "frontend_webbone"
            ).exists() or (candidate / "general-configuration_web").exists():
                return candidate

        for candidate in candidates:
            if (candidate / "backend_webbone").exists() or (candidate / "frontend_webbone").exists():
                return candidate.parent if (candidate / "backend_webbone").exists() else candidate

        for candidate in candidates:
            if candidate.name.lower() in {"railpulse", "software", "start_server"}:
                parent = candidate.parent
                if (parent / "WebOne" / "backend_webbone").exists():
                    return parent

        return Path("E:/Software/RailPulse")

    def _build_module_config(self):
        self.modules = {
            "backend": {
                "label": "Backend",
                "directory": self.project_root / "WebOne" / "backend_webbone",
                "command": ["node", "server.js"],
                "port": "5000",
                "required": True,
            },
            "gencfg": {
                "label": "GenConfig",
                "directory": self.project_root / "general-configuration_web",
                "command": ["node", "server.js"],
                "port": "5002",
                "required": False,
            },
            "frontend": {
                "label": "Frontend",
                "directory": self.project_root / "WebOne" / "frontend_webbone",
                "command": ["npm", "run", "dev"],
                "port": "5173",
                "required": True,
            },
        }
        self.module_order = ["backend", "gencfg", "frontend"]
        self.module_states = {key: {"status": "idle", "detail": ""} for key in self.module_order}

    def _create_ui(self):
        self.root.title("Start Server Manager")
        self.root.after(0, lambda: self.log(f"Root risolta: {self.project_root}"))
        self.root.geometry("980x720")
        self.root.minsize(900, 650)
        self.root.configure(bg="#f3f5f8")
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

        main = ttk.Frame(self.root, padding=14)
        main.grid(row=0, column=0, sticky="nsew")
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main.columnconfigure(0, weight=1)
        main.rowconfigure(2, weight=1)

        header = ttk.Frame(main)
        header.grid(row=0, column=0, sticky="ew", pady=(0, 12))
        header.columnconfigure(1, weight=1)
        ttk.Label(header, text="Start Server Manager", font=("Segoe UI", 18, "bold")).grid(row=0, column=0, sticky="w")
        ttk.Label(header, text=f"Root: {self.project_root}", foreground="#4b5563").grid(row=1, column=0, sticky="w", pady=(4, 0))

        profile_frame = ttk.LabelFrame(main, text="Profilo operativo", padding=10)
        profile_frame.grid(row=1, column=0, sticky="ew", pady=(0, 12))
        ttk.Radiobutton(profile_frame, text="ADTS", variable=self.profile_var, value="adts", command=self._on_profile_change).grid(row=0, column=0, padx=(0, 16))
        ttk.Radiobutton(profile_frame, text="RMT Home", variable=self.profile_var, value="rmt", command=self._on_profile_change).grid(row=0, column=1)

        controls = ttk.Frame(main)
        controls.grid(row=2, column=0, sticky="ew", pady=(0, 12))
        controls.columnconfigure(0, weight=1)
        ttk.Button(controls, text="Avvia Tutto", command=self.start_all).grid(row=0, column=0, padx=(0, 8))
        ttk.Button(controls, text="Ferma Tutto", command=self.stop_all).grid(row=0, column=1, padx=(0, 8))
        ttk.Button(controls, text="Clear Log", command=self.clear_log).grid(row=0, column=2)

        modules_frame = ttk.LabelFrame(main, text="Moduli", padding=10)
        modules_frame.grid(row=3, column=0, sticky="nsew")
        modules_frame.columnconfigure(0, weight=1)
        modules_frame.rowconfigure(0, weight=1)
        modules_grid = ttk.Frame(modules_frame)
        modules_grid.grid(row=0, column=0, sticky="nsew")
        modules_grid.columnconfigure(0, weight=1)
        modules_grid.columnconfigure(1, weight=1)
        modules_grid.columnconfigure(2, weight=1)

        for index, module_key in enumerate(self.module_order):
            row = index // 3
            col = index % 3
            self._create_module_card(modules_grid, module_key, row, col)

        log_frame = ttk.LabelFrame(main, text="Log", padding=10)
        log_frame.grid(row=4, column=0, sticky="nsew", pady=(12, 0))
        log_frame.columnconfigure(0, weight=1)
        log_frame.rowconfigure(0, weight=1)
        self.log_text = scrolledtext.ScrolledText(log_frame, wrap=tk.WORD, height=16)
        self.log_text.grid(row=0, column=0, sticky="nsew")
        self.log_text.configure(state="disabled")

    def _create_module_card(self, parent, module_key, row, col):
        spec = self.modules[module_key]
        card = ttk.Frame(parent, padding=10, relief="solid")
        card.grid(row=row, column=col, sticky="nsew", padx=6, pady=6)
        card.columnconfigure(0, weight=1)

        ttk.Label(card, text=spec["label"], font=("Segoe UI", 12, "bold")).grid(row=0, column=0, sticky="w")
        ttk.Label(card, text=f"Porta {spec['port']}", foreground="#6b7280").grid(row=1, column=0, sticky="w", pady=(2, 6))

        status_row = ttk.Frame(card)
        status_row.grid(row=2, column=0, sticky="w")
        self.module_widgets[module_key] = {}
        self.module_widgets[module_key]["indicator"] = ttk.Label(status_row, text="●", foreground="#9ca3af", font=("Segoe UI", 16))
        self.module_widgets[module_key]["indicator"].grid(row=0, column=0, padx=(0, 6))
        self.module_widgets[module_key]["status"] = ttk.Label(status_row, text="In attesa")
        self.module_widgets[module_key]["status"].grid(row=0, column=1)

        button_row = ttk.Frame(card)
        button_row.grid(row=3, column=0, sticky="w", pady=(8, 0))
        self.module_widgets[module_key]["start"] = ttk.Button(button_row, text="Start", command=lambda key=module_key: self.start_module(key))
        self.module_widgets[module_key]["start"].grid(row=0, column=0, padx=(0, 6))
        self.module_widgets[module_key]["stop"] = ttk.Button(button_row, text="Stop", command=lambda key=module_key: self.stop_module(key))
        self.module_widgets[module_key]["stop"].grid(row=0, column=1)

    def _on_profile_change(self):
        self.log("Profilo selezionato: " + ("ADTS" if self.profile_var.get() == "adts" else "RMT Home"))
        self._refresh_ui_state()
        self.root.after(200, self._check_server_state)

    def _refresh_ui_state(self):
        self._set_module_state("backend", self.module_states["backend"]["status"], self.module_states["backend"]["detail"])
        self._set_module_state("gencfg", self.module_states["gencfg"]["status"], self.module_states["gencfg"]["detail"])
        self._set_module_state("frontend", self.module_states["frontend"]["status"], self.module_states["frontend"]["detail"])
        self._refresh_buttons()

    def _refresh_buttons(self):
        for module_key in self.module_order:
            running = module_key in self.processes and self.processes[module_key] is not None
            self.module_widgets[module_key]["start"].configure(state="disabled" if self.busy or running else "normal")
            self.module_widgets[module_key]["stop"].configure(state="normal" if running and not self.busy else "disabled")

    def _check_server_state(self):
        self.log("Controllo stato iniziale dei server...")
        for module_key in self.module_order:
            self._evaluate_module_state(module_key)
        self._refresh_buttons()

    def _evaluate_module_state(self, module_key):
        if module_key in self.processes and self.processes[module_key] is not None:
            process = self.processes[module_key]
            if process.poll() is None:
                self._set_module_state(module_key, "running", f"PID {process.pid}")
                return
            self.processes.pop(module_key, None)

        valid, reason = self._validate_module(module_key)
        if module_key == "gencfg" and self.profile_var.get() == "rmt" and not valid and reason == "optional-missing":
            self._set_module_state(module_key, "skipped", "directory assente; salto automatico")
            return
        if not valid:
            self._set_module_state(module_key, "error", "directory mancante")
            return

        port = self.modules[module_key]["port"]
        if self._is_port_open(port):
            self._set_module_state(module_key, "running", f"porta {port} in ascolto")
        else:
            self._set_module_state(module_key, "stopped", f"porta {port} libera")

    def _is_port_open(self, port):
        try:
            with socket.create_connection(("127.0.0.1", int(port)), timeout=0.5):
                return True
        except OSError:
            return False

    def _set_module_state(self, module_key, status, detail=""):
        if module_key not in self.module_widgets:
            return
        self.module_states[module_key]["status"] = status
        self.module_states[module_key]["detail"] = detail

        text = {
            "idle": "In attesa",
            "running": "In esecuzione",
            "stopped": "Fermato",
            "error": "Errore",
            "skipped": "Saltato",
        }.get(status, "In attesa")
        color = {
            "idle": "#9ca3af",
            "running": "#16a34a",
            "stopped": "#6b7280",
            "error": "#dc2626",
            "skipped": "#d97706",
        }.get(status, "#9ca3af")
        self.module_widgets[module_key]["indicator"].configure(foreground=color)
        self.module_widgets[module_key]["status"].configure(text=text + (f" - {detail}" if detail else ""))

    def _set_busy(self, value):
        self.busy = value
        self._refresh_buttons()

    def log(self, message):
        self.root.after(0, lambda: self._append_log(message))

    def _append_log(self, message):
        if not self.log_text:
            return
        self.log_text.configure(state="normal")
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.configure(state="disabled")
        self.log_text.see(tk.END)

    def clear_log(self):
        self.log_text.configure(state="normal")
        self.log_text.delete("1.0", tk.END)
        self.log_text.configure(state="disabled")

    def _validate_module(self, module_key):
        spec = self.modules[module_key]
        directory = spec["directory"]
        if directory.exists() and directory.is_dir():
            return True, None

        fallback_candidates = []
        root = self.project_root
        if root:
            fallback_candidates.append(root / "WebOne" / module_key.replace("gencfg", "general-configuration_web") if module_key != "frontend" else root / "WebOne" / "frontend_webbone")
            fallback_candidates.append(root / module_key.replace("gencfg", "general-configuration_web") if module_key != "frontend" else root / "frontend_webbone")
            fallback_candidates.append(root / "backend_webbone" if module_key == "backend" else root / "frontend_webbone" if module_key == "frontend" else root / "general-configuration_web")
            fallback_candidates.append(Path("E:/Software/RailPulse") / "WebOne" / ("backend_webbone" if module_key == "backend" else "frontend_webbone" if module_key == "frontend" else ""))
            fallback_candidates.append(Path("E:/Software/RailPulse") / ("backend_webbone" if module_key == "backend" else "frontend_webbone" if module_key == "frontend" else "general-configuration_web"))

        for candidate in fallback_candidates:
            if candidate and candidate.exists() and candidate.is_dir():
                self.modules[module_key]["directory"] = candidate
                return True, None

        if module_key == "gencfg" and self.profile_var.get() == "rmt":
            return False, "optional-missing"
        return False, "missing"

    def _get_frontend_command(self):
        if self.profile_var.get() == "rmt":
            return ["npm.cmd", "run", "dev"]
        return ["npm", "run", "dev"]

    def _build_command(self, module_key):
        if module_key == "frontend":
            return self._get_frontend_command()
        return self.modules[module_key]["command"]

    def start_module(self, module_key):
        if self.busy:
            return
        if module_key in self.processes and self.processes[module_key] is not None:
            self.log(f"{self.modules[module_key]['label']} è già in esecuzione.")
            return

        valid, reason = self._validate_module(module_key)
        if not valid:
            if module_key == "gencfg" and reason == "optional-missing":
                self._set_module_state(module_key, "skipped", "directory assente; salto automatico")
                self.log("[GenConfig] Directory assente nel profilo RMT Home; modulo saltato.")
                return
            self._set_module_state(module_key, "error", "directory mancante")
            self.log(f"[{self.modules[module_key]['label']}] Directory richiesta non trovata: {self.modules[module_key]['directory']}")
            return

        command = self._build_command(module_key)
        cwd = self.modules[module_key]["directory"]
        self.log(f"Avvio {self.modules[module_key]['label']} in {cwd}")
        self._set_module_state(module_key, "running")

        try:
            env = os.environ.copy()
            env.setdefault("BROWSER", "none")
            creationflags = subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0
            process = subprocess.Popen(
                command,
                cwd=str(cwd),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                stdin=subprocess.DEVNULL,
                text=True,
                bufsize=1,
                env=env,
                creationflags=creationflags,
            )
            self.processes[module_key] = process
            self._refresh_buttons()
            threading.Thread(target=self._read_output, args=(module_key, process), daemon=True).start()
        except (FileNotFoundError, OSError) as exc:
            self.processes.pop(module_key, None)
            self._set_module_state(module_key, "error", str(exc))
            self.log(f"[{self.modules[module_key]['label']}] Errore di avvio: {exc}")

    def _read_output(self, module_key, process):
        try:
            if process.stdout is None:
                self.log(f"[{self.modules[module_key]['label']}] Nessun output disponibile.")
                exit_code = process.wait()
            else:
                for line in iter(process.stdout.readline, ""):
                    if line:
                        self.log(f"[{self.modules[module_key]['label']}] {line.rstrip()}")
                exit_code = process.wait()
        except Exception as exc:
            exit_code = process.returncode
            self.log(f"[{self.modules[module_key]['label']}] Errore durante il monitoraggio: {exc}")
        finally:
            self.root.after(0, lambda: self._finalize_process(module_key, exit_code))

    def _finalize_process(self, module_key, exit_code):
        if module_key in self.processes and self.processes[module_key] is not None:
            self.processes.pop(module_key, None)
        if self.module_states[module_key]["status"] != "skipped":
            self._set_module_state(module_key, "error" if exit_code not in (0, None) else "stopped", f"codice {exit_code}")
        self._refresh_buttons()
        self.log(f"[{self.modules[module_key]['label']}] Processo terminato con codice {exit_code}")

    def stop_module(self, module_key):
        process = self.processes.get(module_key)
        if process is None:
            self._set_module_state(module_key, "stopped", "nessun processo avviato")
            return

        try:
            if os.name == "nt":
                subprocess.run(["taskkill", "/PID", str(process.pid), "/T", "/F"], check=False, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            else:
                process.terminate()
                process.wait(timeout=5)
        except (subprocess.SubprocessError, OSError, subprocess.TimeoutExpired):
            self.log(f"[{self.modules[module_key]['label']}] Chiusa forzata completata.")
        finally:
            self.processes.pop(module_key, None)
            self._set_module_state(module_key, "stopped", "fermato")
            self._refresh_buttons()
            self.log(f"[{self.modules[module_key]['label']}] Fermato.")

    def start_all(self):
        if self.busy:
            return
        threading.Thread(target=self._start_all_sequence, daemon=True).start()

    def _start_all_sequence(self):
        self.root.after(0, lambda: self._set_busy(True))
        try:
            self.log("Avvio sequenziale dei moduli...")
            for module_key in ["backend", "gencfg", "frontend"]:
                if module_key == "gencfg" and self.profile_var.get() == "rmt":
                    valid, reason = self._validate_module(module_key)
                    if not valid and reason == "optional-missing":
                        self._set_module_state(module_key, "skipped", "directory assente; salto automatico")
                        self.log("[GenConfig] Directory assente nel profilo RMT Home; modulo saltato.")
                        continue
                self.start_module(module_key)
                if module_key != "frontend":
                    time.sleep(2)
        finally:
            self.root.after(0, lambda: self._set_busy(False))

    def stop_all(self):
        if self.busy:
            return
        for module_key in self.module_order:
            self.stop_module(module_key)

    def on_close(self):
        self.stop_all()
        self.root.destroy()

    def validate_configuration(self):
        errors = []
        for module_key in self.module_order:
            valid, reason = self._validate_module(module_key)
            if module_key == "gencfg" and reason == "optional-missing":
                print(f"[WARN] {self.modules[module_key]['label']}: directory mancante, modulo saltato per il profilo RMT Home")
            elif not valid:
                errors.append(self.modules[module_key]['label'])
                print(f"[ERROR] {self.modules[module_key]['label']}: directory mancante -> {self.modules[module_key]['directory']}")
            else:
                print(f"[OK] {self.modules[module_key]['label']}: {self.modules[module_key]['directory']}")
        return 0 if not errors else 1


def main():
    parser = argparse.ArgumentParser(description="GUI per avviare e fermare i server WebOne")
    parser.add_argument("--validate", action="store_true", help="Verifica le directory e termina")
    args = parser.parse_args()

    root = tk.Tk()
    app = ServerManagerGUI(root)
    if args.validate:
        exit_code = app.validate_configuration()
        root.destroy()
        sys.exit(exit_code)
    root.mainloop()


if __name__ == "__main__":
    main()
