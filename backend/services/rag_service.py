import chromadb
import hashlib
import json
import os
import re
import requests
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer
from .tracking_service import TrackingService
from database import SessionLocal

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
CHROMA_DIR = os.path.join(os.path.dirname(__file__), '..', 'chroma_data')

class RAGService:
    _embedder = None
    _client = None

    @classmethod
    def _get_embedder(cls):
        if cls._embedder is None:
            print("Loading sentence-transformers model (all-MiniLM-L6-v2)...")
            cls._embedder = SentenceTransformer('all-MiniLM-L6-v2')
            print("Model loaded.")
        return cls._embedder

    @classmethod
    def _get_client(cls):
        if cls._client is None:
            cls._client = chromadb.PersistentClient(path=CHROMA_DIR)
        return cls._client

    @staticmethod
    def _collection_name(topic, links):
        raw = f"{topic}::{json.dumps(links, sort_keys=True)}"
        return "rag_" + hashlib.md5(raw.encode()).hexdigest()[:16]

    @staticmethod
    def _scrape_article(url):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            resp = requests.get(url, headers=headers, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, 'html.parser')
            for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
                tag.decompose()
            text = soup.get_text(separator='\n')
            lines = [line.strip() for line in text.splitlines() if line.strip()]
            return '\n'.join(lines[:500])
        except Exception as e:
            return f"[Erro ao acessar {url}: {e}]"

    @classmethod
    def _ensure_collection(cls, topic, links, user_id=0):
        embedder = cls._get_embedder()
        client = cls._get_client()
        name = cls._collection_name(topic, links)

        try:
            collection = client.get_collection(name)
            count = collection.count()
            if count > 0:
                return collection
        except Exception:
            pass

        try:
            client.delete_collection(name)
        except Exception:
            pass
        collection = client.create_collection(name)

        db = SessionLocal()
        try:
            for i, url in enumerate(links):
                content = cls._scrape_article(url)
                if not content or content.startswith("[Erro"):
                    continue
                chunks = cls._chunk_text(content, 1000)
                for j, chunk in enumerate(chunks):
                    doc_id = f"{i}_{j}"
                    embedding = embedder.encode(chunk).tolist()
                    collection.add(
                        embeddings=[embedding],
                        documents=[chunk],
                        metadatas=[{"url": url, "article_index": i, "chunk": j}],
                        ids=[doc_id]
                    )
                TrackingService.log_usage(
                    db=db, user_id=user_id, model=EMBEDDING_MODEL,
                    prompt_tokens=0, completion_tokens=0, cost=0.0
                )
        finally:
            db.close()
        return collection

    @staticmethod
    def _chunk_text(text, max_chars=1000):
        words = text.split()
        chunks = []
        current = []
        current_len = 0
        for w in words:
            current_len += len(w) + 1
            if current_len > max_chars and current:
                chunks.append(' '.join(current))
                current = [w]
                current_len = len(w) + 1
            else:
                current.append(w)
        if current:
            chunks.append(' '.join(current))
        return chunks or [text[:max_chars]]

    @classmethod
    def query(cls, topic, links, question, top_k=1, user_id=0):
        collection = cls._ensure_collection(topic, links, user_id)
        embedder = cls._get_embedder()
        q_emb = embedder.encode(question).tolist()

        db = SessionLocal()
        try:
            TrackingService.log_usage(
                db=db, user_id=user_id, model=EMBEDDING_MODEL,
                prompt_tokens=0, completion_tokens=0, cost=0.0
            )
        finally:
            db.close()

        results = collection.query(
            query_embeddings=[q_emb],
            n_results=top_k
        )

        best_url = None
        best_content = ""
        best_distance = float('inf')

        if results and results.get('metadatas') and results['metadatas'][0]:
            best_meta = results['metadatas'][0][0]
            best_url = best_meta.get('url')
            best_distance = results['distances'][0][0] if results.get('distances') else 0

        if results and results.get('documents') and results['documents'][0]:
            best_content = results['documents'][0][0]

        return {
            "best_url": best_url,
            "best_content": best_content,
            "distance": best_distance,
            "all_urls": links
        }
