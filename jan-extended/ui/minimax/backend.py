import os
import subprocess
import json
import requests
import io
import threading
import logging
import platform
import psutil
from datetime import datetime
from fastapi import FastAPI, Request, UploadFile, File
from pydantic import BaseModel
from typing import Any, Dict, Optional, List
import uvicorn

# RAG Imports
try:
    import chromadb
    from sentence_transformers import SentenceTransformer
except ImportError:
    print("RAG libraries not found. Run: pip install chromadb sentence-transformers")

app = FastAPI()

# Global State
MODEL_PATHS = [
    os.path.expanduser("~/.lmstudio/models"),
    os.path.expanduser("~/.ollama/models"),
    "C:/Users/Silva/jan/models" # Fallback
]

class ModelManager:
    def __init__(self):
        self.active_model_id = None
        self.llm = None
        self.models = []
        self.scan_models()
        # Auto-load first real model on startup
        if self.models:
            print(f"AUTO-LOADING first available model: {self.models[0]['id']}")
            self.load_model(self.models[0]['id'])

    def scan_models(self):
        self.models = []
        
        # Scan LM Studio models
        lm_path = os.path.expanduser("~/.lmstudio/models")
        if os.path.exists(lm_path):
            for root, dirs, files in os.walk(lm_path):
                for file in files:
                    if file.endswith(".gguf") and "mmproj" not in file:
                        rel_path = os.path.relpath(os.path.join(root, file), lm_path)
                        full_path = os.path.join(root, file).replace("\\", "/")
                        self.models.append({
                            "id": rel_path.replace("\\", "/"),
                            "name": file.replace(".gguf", ""),
                            "status": "downloaded",
                            "path": full_path
                        })
        
        # Scan Ollama models folder too
        ollama_path = os.path.expanduser("~/.ollama/models/blobs")
        if os.path.exists(ollama_path):
            for file in os.listdir(ollama_path):
                if file.endswith(".gguf"):
                    self.models.append({
                        "id": file.replace(".gguf", ""),
                        "name": file.replace(".gguf", ""),
                        "status": "downloaded",
                        "path": os.path.join(ollama_path, file).replace("\\", "/")
                    })
        
        print(f"Found {len(self.models)} models on disk")

    def load_model(self, model_id):
        self.active_model_id = model_id
        # Use llama-cpp-python for native inference
        try:
            from llama_cpp import Llama
            # Find path
            path = next((m["path"] for m in self.models if m["id"] == model_id), None)
            if path and os.path.exists(path):
                print(f"DEBUG: Loading model {model_id} natively via llama.cpp")
                
                # Unload previous model if any
                if self.llm:
                    del self.llm
                    self.llm = None
                    
                # Load the model with optimized parameters
                # Only use chat_handler if it's explicitly a vision model to avoid breaking native chat templates
                kwargs = {
                    "model_path": path,
                    "n_ctx": 4096,
                    "n_gpu_layers": -1,
                    "verbose": False
                }
                
                # Check for mmproj file in the same directory for Vision support
                if "vision" in path.lower() or "llava" in path.lower() or "moondream" in path.lower():
                    model_dir = os.path.dirname(path)
                    mmproj_path = next((os.path.join(model_dir, f) for f in os.listdir(model_dir) if "mmproj" in f and f.endswith(".gguf")), None)
                    if mmproj_path:
                        try:
                            from llama_cpp.llama_chat_format import Llava15ChatHandler
                            kwargs["chat_handler"] = Llava15ChatHandler(clip_model_path=mmproj_path)
                            print(f"DEBUG: Vision enabled with mmproj: {mmproj_path}")
                        except Exception as ve:
                            print(f"DEBUG: Failed to load vision handler: {ve}")

                self.llm = Llama(**kwargs)
                return True
        except Exception as e:
            print(f"ERROR: Failed to load model natively: {str(e)}")
        return False

    async def chat(self, messages: list):
        if not self.llm:
            return {"choices": [{"message": {"role": "assistant", "content": "[NATIVE ENGINE] No model loaded. Please load a model from the Hub first."}}]}
            
        # --- PHASE 2: MEMORY UPGRADE (RAG) ---
        try:
            user_query = messages[-1]["content"]
            if isinstance(user_query, str) and len(user_query) > 5:
                context = await memory_manager.search(user_query)
                if context:
                    # Inject context into the system prompt or as a helper message
                    context_msg = f"--- LOCAL DOCUMENT CONTEXT ---\nThe following information was found in your local files:\n{context}\n-----------------------------"
                    # Find system message or insert at beginning
                    system_msg_idx = -1
                    for idx, msg in enumerate(messages):
                        if msg["role"] == "system":
                            system_msg_idx = idx
                            break
                    
                    if system_msg_idx != -1:
                        messages[system_msg_idx]["content"] += f"\n\n{context_msg}"
                    else:
                        messages.insert(0, {"role": "system", "content": context_msg})
        except Exception as e:
            print(f"RAG Error: {e}")
        # ------------------------------------

        # Native inference
        try:
            # Force AI Desktop identity
            system_prompt = (
                "You are AI Desktop, a powerful built-in AI assistant. "
                "You are running natively inside AI Desktop — a self-contained AI operating system. "
                "You have no connection to any external services. "
                "Your name is AI Desktop. Never say you were trained by Google or OpenAI. "
                "Be concise, helpful, and direct. "
                "If the user asks you to perform an action on their computer (like opening an app, checking system status, or managing files), "
                "you can execute PowerShell commands by wrapping them exactly like this: [RUN_COMMAND: <your_command>]. "
                "For example, to open notepad: [RUN_COMMAND: notepad.exe]. "
                "You have special access to 'Plugin Channels':\n"
                "- Outlook: Use 'Get-OutlookEmails' or 'Send-OutlookEmail' (simulated via Python helpers).\n"
                "- WhatsApp: Use [RUN_COMMAND: start whatsapp://send?text=Hello]\n"
                "- Phone Link: Use [RUN_COMMAND: start ms-phonelink://]\n"
                "- Browsers: Use [RUN_COMMAND: start chrome.exe https://google.com] or [RUN_COMMAND: start msedge.exe https://bing.com]"
            )
            
            # Check if system prompt exists
            has_system = False
            for m in messages:
                if m.get("role") == "system":
                    m["content"] = system_prompt + "\n\n" + m.get("content", "")
                    has_system = True
                    break
                    
            if not has_system:
                messages.insert(0, {"role": "system", "content": system_prompt})

            response = self.llm.create_chat_completion(
                messages=messages,
                stream=False,
                max_tokens=1024,
                repeat_penalty=1.1,
                stop=["<|im_end|>", "<|endoftext|>", "</s>", "<|eot_id|>", "<end_of_turn>"]
            )
            return response
        except Exception as e:
            print(f"ERROR: Inference failed: {str(e)}")
            return {
                "choices": [{
                    "message": {
                        "role": "assistant",
                        "content": f"Inference Error: {str(e)}"
                    }
                }]
            }

manager = ModelManager()

@app.get("/list-local-models")
async def list_local_models():
    manager.scan_models()
    return {
        "models": manager.models,
        "active_model": manager.active_model_id
    }

@app.post("/load-model")
async def load_model_endpoint(req: Dict[str, Any]):
    model_id = req.get("model_id")
    success = manager.load_model(model_id)
    return {"success": success, "message": f"Model {model_id} loaded."}

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = ""
        if file.filename.endswith(".pdf"):
            import fitz
            doc = fitz.open(stream=content, filetype="pdf")
            for page in doc:
                text += page.get_text() + "\n"
        elif file.filename.endswith(".docx"):
            from docx import Document
            doc = Document(io.BytesIO(content))
            for para in doc.paragraphs:
                text += para.text + "\n"
        elif file.filename.endswith(".txt"):
            text = content.decode("utf-8")
        else:
            return {"error": "Unsupported file format"}
            
        return {"success": True, "text": text}
    except Exception as e:
        return {"error": f"Extraction failed: {str(e)}"}

@app.post("/chat")
async def chat_proxy(req: Dict[str, Any]):
    messages = req.get("messages", [])
    if not any(m.get("role") == "system" for m in messages):
        messages.insert(0, {
            "role": "system", 
            "content": "You are a concise AI assistant. Provide accurate, technical, and direct answers."
        })
    return await manager.chat(messages)

# Tools registry
TOOLS = {
    "run_terminal": {
        "name": "run_terminal",
        "description": "Execute terminal commands",
        "parameters": {"type": "object", "properties": {"command": {"type": "string"}}}
    }
}

@app.post("/mcp")
async def mcp_handler(req: Dict[str, Any]):
    # Simplified MCP handler
    return {"jsonrpc": "2.0", "result": {"content": [{"type": "text", "text": "MCP Action Received"}]}, "id": req.get("id")}

@app.post("/terminal")
async def run_terminal(req: Dict[str, Any]):
    command = req.get("command")
    if not command:
        return {"error": "No command provided"}
        
    try:
        # Run powershell command securely
        # Special check for our internal Python-based helpers
        if command.startswith("Get-OutlookEmails"):
            return await get_outlook_emails()
            
        result = subprocess.run(
            ["powershell", "-Command", command],
            capture_output=True,
            text=True,
            timeout=30,
            cwd=os.path.expanduser("~") # Run in user home by default
        )
        
        output = result.stdout if result.stdout else ""
        if result.stderr:
            output += f"\n[Errors/Warnings]:\n{result.stderr}"
            
        # Truncate very long output to avoid breaking context window
        if len(output) > 2000:
            output = output[:2000] + "\n...[Output truncated]"
            
        return {"output": output, "exit_code": result.returncode}
    except Exception as e:
        return {"error": str(e)}

import platform
import base64

@app.get("/hardware-info")
async def get_hardware_info():
    try:
        import psutil
        ram = psutil.virtual_memory()
        total_ram_gb = round(ram.total / (1024**3), 1)
        available_ram_gb = round(ram.available / (1024**3), 1)
        
        cpu_model = platform.processor()
        
        vram_gb = 0
        gpu_name = "Unknown GPU"
        try:
            output = subprocess.check_output(
                ["wmic", "path", "win32_VideoController", "get", "name,adapterram"],
                text=True
            )
            lines = [l.strip() for l in output.split("\n") if l.strip()][1:]
            for line in lines:
                parts = line.split()
                if len(parts) > 1:
                    try:
                        vram_bytes = int(parts[-1])
                        vram_gb = max(vram_gb, round(vram_bytes / (1024**3), 1))
                        gpu_name = " ".join(parts[:-1])
                    except:
                        pass
        except:
            pass

        return {
            "success": True,
            "os": platform.system(),
            "cpu": cpu_model,
            "ram_total_gb": total_ram_gb,
            "ram_available_gb": available_ram_gb,
            "gpu_name": gpu_name,
            "vram_total_gb": vram_gb
        }
    except ImportError:
        return {"success": False, "error": "psutil not installed. Please run: pip install psutil"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/screenshot")
async def take_screenshot():
    try:
        from PIL import ImageGrab
        import io
        screenshot = ImageGrab.grab()
        if screenshot.mode in ('RGBA', 'P'):
            screenshot = screenshot.convert('RGB')
        
        screenshot.thumbnail((1280, 720))
        
        buffered = io.BytesIO()
        screenshot.save(buffered, format="JPEG", quality=80)
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        return {"success": True, "image": f"data:image/jpeg;base64,{img_str}"}
    except ImportError:
        return {"success": False, "error": "Pillow not installed. Please run: pip install Pillow"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/system-pulse")
async def get_system_pulse():
    try:
        import psutil
        cpu_usage = psutil.cpu_percent(interval=None)
        ram = psutil.virtual_memory()
        ram_usage = ram.percent
        
        # Try to get GPU usage via nvidia-smi if available, else fallback
        gpu_usage = 0
        try:
            output = subprocess.check_output(
                ["nvidia-smi", "--query-gpu=utilization.gpu", "--format=csv,noheader,nounits"],
                text=True,
                timeout=1
            )
            gpu_usage = int(output.strip())
        except:
            # Fallback for integrated or non-nvidia GPUs on Windows
            try:
                output = subprocess.check_output(
                    ["powershell", "-Command", "Get-Counter '\\GPU Engine(*)\\Utilization Percentage' | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue"],
                    text=True,
                    timeout=1
                )
                vals = [float(v) for v in output.split("\n") if v.strip()]
                if vals:
                    gpu_usage = round(sum(vals) / len(vals), 1)
            except:
                pass

        return {
            "success": True,
            "cpu": cpu_usage,
            "ram": ram_usage,
            "gpu": gpu_usage,
            "timestamp": platform.node()
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# --- MEMORY MANAGER (RAG) ---
class MemoryManager:
    def __init__(self):
        self.db_path = os.path.join(os.path.expanduser("~"), "AI_Desktop_Memory")
        self.client = None
        self.collection = None
        self.model = None
        self.is_indexing = False

    def ensure_init(self):
        if self.client is None:
            try:
                self.client = chromadb.PersistentClient(path=self.db_path)
                self.collection = self.client.get_or_create_collection(name="user_docs")
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
            except Exception as e:
                print(f"Memory Init Error: {e}")

    async def index_documents(self):
        self.ensure_init()
        if self.is_indexing: return "Already indexing"
        self.is_indexing = True
        
        try:
            docs_path = os.path.join(os.path.expanduser("~"), "Documents")
            indexed_count = 0
            
            for root, _, files in os.walk(docs_path):
                for file in files:
                    if file.endswith(('.txt', '.md', '.pdf', '.docx')):
                        # Simple chunking logic for now
                        file_path = os.path.join(root, file)
                        try:
                            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                                content = f.read()
                                if len(content) < 10: continue
                                
                                # Chunking (500 chars)
                                chunks = [content[i:i+500] for i in range(0, len(content), 500)]
                                for j, chunk in enumerate(chunks[:20]): # Limit per file for speed
                                    self.collection.add(
                                        documents=[chunk],
                                        metadatas=[{"source": file, "path": file_path}],
                                        ids=[f"{file}_{j}_{indexed_count}"]
                                    )
                                indexed_count += 1
                        except: continue
            
            self.is_indexing = False
            return f"Successfully indexed {indexed_count} documents."
        except Exception as e:
            self.is_indexing = False
            return f"Indexing failed: {str(e)}"

    async def search(self, query: str):
        self.ensure_init()
        if not self.collection or not self.model: return None
        
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=3
            )
            if results and results['documents'] and results['documents'][0]:
                return "\n".join(results['documents'][0])
            return None
        except: return None

memory_manager = MemoryManager()

@app.post("/memory/index")
async def start_indexing():
    message = await memory_manager.index_documents()
    return {"success": True, "message": message}

@app.get("/memory/status")
async def get_memory_status():
    memory_manager.ensure_init()
    count = memory_manager.collection.count() if memory_manager.collection else 0
    return {"success": True, "count": count, "is_indexing": memory_manager.is_indexing}

# Outlook Helper (Internal)
async def get_outlook_emails():
    try:
        import win32com.client
        outlook = win32com.client.Dispatch("Outlook.Application").GetNamespace("MAPI")
        inbox = outlook.GetDefaultFolder(6) # 6 = olFolderInbox
        messages = inbox.Items
        messages.Sort("[ReceivedTime]", True)
        
        email_list = []
        for i in range(1, min(6, len(messages) + 1)):
            msg = messages.Item(i)
            email_list.append(f"From: {msg.SenderName} | Subject: {msg.Subject} | Date: {msg.ReceivedTime}")
            
        return {"output": "\n".join(email_list) if email_list else "No recent emails found."}
    except Exception as e:
        return {"error": f"Outlook Error: {str(e)} (Make sure Outlook is installed and configured)"}

if __name__ == "__main__":
    print("\n------------------------------------")
    print("   JAN-EXTENDED NATIVE ENGINE")
    print("   Running on http://localhost:3000")
    print("------------------------------------\n")
    uvicorn.run(app, host="0.0.0.0", port=3000)

