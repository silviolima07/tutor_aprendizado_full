try:
    from ddgs import DDGS
except ImportError:
    try:
        from duckduckgo_search import DDGS
    except ImportError:
        DDGS = None

import json
import requests
import time
import feedparser
import urllib.parse

class SearchService:
    @staticmethod
    def search_sources(topic: str, sources: list[str], max_results_per_source: int = 5):
        results = []

        if DDGS is None:
            print("[SEARCH SERVICE] Biblioteca DDGS não instalada. Retornando lista vazia.")
            return results

        try:
            with DDGS() as ddgs:
                if "YouTube" in sources:
                    try:
                        yt_results = list(ddgs.text(f"site:youtube.com {topic} tutorial", max_results=max_results_per_source))
                        for r in yt_results:
                            results.append({"title": r.get('title'), "url": r.get('href'), "source": "YouTube", "snippet": r.get('body')})
                        print(f"[SEARCH SERVICE] YouTube: {len(yt_results)} resultados encontrados.")
                    except Exception as e:
                        print(f"[SEARCH SERVICE] Falha no YouTube: {e}")

                if "Medium" in sources:
                    try:
                        med_results = list(ddgs.text(f"{topic} site:medium.com", max_results=max_results_per_source))
                        for r in med_results:
                            results.append({"title": r.get('title'), "url": r.get('href'), "source": "Medium", "snippet": r.get('body')})
                        print(f"[SEARCH SERVICE] Medium: {len(med_results)} resultados encontrados.")
                    except Exception as e:
                        print(f"[SEARCH SERVICE] Falha no Medium: {e}")

                    # Fallback: RSS feed if DDGS returned few/no results
                    medium_count = len([r for r in results if r.get("source") == "Medium"])
                    if medium_count < max_results_per_source:
                        print("[SEARCH SERVICE] Tentando fallback via RSS do Medium...")
                        rss_results = SearchService._search_medium_rss(topic, max_results_per_source - medium_count)
                        for r in rss_results:
                            results.append(r)
                        print(f"[SEARCH SERVICE] Medium (RSS): {len(rss_results)} resultados adicionais.")

                if "Documentação Oficial" in sources:
                    try:
                        doc_results = list(ddgs.text(f"{topic} official documentation", max_results=max_results_per_source))
                        for r in doc_results:
                            results.append({"title": r.get('title'), "url": r.get('href'), "source": "Documentação", "snippet": r.get('body')})
                        print(f"[SEARCH SERVICE] Docs: {len(doc_results)} resultados encontrados.")
                    except Exception as e:
                        print(f"[SEARCH SERVICE] Falha na Documentação: {e}")

        except Exception as e:
            print(f"[SEARCH SERVICE] Falha geral no DDGS (ignorada): {e}")

        print(f"[SEARCH SERVICE] Total de resultados: {len(results)}")
        return results

    @staticmethod
    def _search_medium_rss(topic: str, max_results: int):
        """Busca artigos do Medium via RSS feed da tag."""
        results = []
        try:
            # Normaliza o tópico para usar como tag do Medium
            tag = urllib.parse.quote(topic.lower().strip().replace(' ', '-'))
            rss_url = f"https://medium.com/feed/tag/{tag}"
            
            feed = feedparser.parse(rss_url)
            
            for entry in feed.entries[:max_results]:
                results.append({
                    "title": entry.get('title', ''),
                    "url": entry.get('link', ''),
                    "source": "Medium",
                    "snippet": entry.get('summary', '')[:200]
                })
        except Exception as e:
            print(f"[SEARCH SERVICE] Falha no RSS do Medium: {e}")
        
        return results
