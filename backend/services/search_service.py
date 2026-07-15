# backend/services/search_service.py
import json
import requests
import time
import feedparser
import urllib.parse
import re

# Tenta importar DDGS com fallback
try:
    from ddgs import DDGS
except ImportError:
    try:
        from duckduckgo_search import DDGS
    except ImportError:
        DDGS = None
        print("[SEARCH SERVICE] ⚠️ Biblioteca DDGS não encontrada. Usando apenas RSS e mocks.")

class SearchService:
    @staticmethod
    def search_sources(topic: str, sources: list[str], max_results_per_source: int = 5):
        """Busca artigos nas fontes especificadas."""
        results = []
        print(f"[SEARCH SERVICE] 🔍 Buscando: '{topic}' em {sources}")
        
        # Tenta DDGS se disponível
        if DDGS is not None:
            try:
                with DDGS() as ddgs:
                    if "YouTube" in sources:
                        try:
                            yt_results = list(ddgs.text(f"site:youtube.com {topic} tutorial", max_results=max_results_per_source))
                            for r in yt_results:
                                results.append({
                                    "title": r.get('title', 'Sem título'),
                                    "url": r.get('href', '#'),
                                    "source": "YouTube",
                                    "snippet": r.get('body', '')[:200]
                                })
                            print(f"[SEARCH SERVICE] ✅ YouTube: {len(yt_results)} resultados")
                        except Exception as e:
                            print(f"[SEARCH SERVICE] ❌ Falha no YouTube: {e}")

                    if "Medium" in sources:
                        medium_count_before = len([r for r in results if r.get("source") == "Medium"])
                        
                        # Tenta DDGS para Medium
                        try:
                            med_results = list(ddgs.text(f"{topic} site:medium.com", max_results=max_results_per_source))
                            for r in med_results:
                                results.append({
                                    "title": r.get('title', 'Sem título'),
                                    "url": r.get('href', '#'),
                                    "source": "Medium",
                                    "snippet": r.get('body', '')[:200]
                                })
                            print(f"[SEARCH SERVICE] ✅ Medium (DDGS): {len(med_results)} resultados")
                        except Exception as e:
                            print(f"[SEARCH SERVICE] ❌ Falha no Medium (DDGS): {e}")

                        # Fallback: RSS se DDGS não retornou resultados suficientes
                        medium_count = len([r for r in results if r.get("source") == "Medium"])
                        if medium_count < max_results_per_source:
                            needed = max_results_per_source - medium_count
                            print(f"[SEARCH SERVICE] 🔄 Fallback RSS do Medium: buscando {needed} resultados...")
                            rss_results = SearchService._search_medium_rss(topic, needed)
                            for r in rss_results:
                                # Verifica se o link já não foi adicionado
                                if not any(existing.get("url") == r.get("url") for existing in results):
                                    results.append(r)
                            print(f"[SEARCH SERVICE] ✅ Medium (RSS): {len(rss_results)} resultados adicionais")

                        # Se ainda não tiver resultados, usa mocks
                        medium_count = len([r for r in results if r.get("source") == "Medium"])
                        if medium_count == 0:
                            print(f"[SEARCH SERVICE] 📝 Usando mocks para Medium")
                            mock_results = SearchService._get_mock_medium_articles(topic, max_results_per_source)
                            for r in mock_results:
                                if not any(existing.get("url") == r.get("url") for existing in results):
                                    results.append(r)

                    if "Documentação Oficial" in sources:
                        try:
                            doc_results = list(ddgs.text(f"{topic} official documentation", max_results=max_results_per_source))
                            for r in doc_results:
                                results.append({
                                    "title": r.get('title', 'Sem título'),
                                    "url": r.get('href', '#'),
                                    "source": "Documentação",
                                    "snippet": r.get('body', '')[:200]
                                })
                            print(f"[SEARCH SERVICE] ✅ Documentação: {len(doc_results)} resultados")
                        except Exception as e:
                            print(f"[SEARCH SERVICE] ❌ Falha na Documentação: {e}")

                    if "GitHub" in sources:
                        try:
                            gh_results = list(ddgs.text(f"{topic} site:github.com", max_results=max_results_per_source))
                            for r in gh_results:
                                results.append({
                                    "title": r.get('title', 'Sem título'),
                                    "url": r.get('href', '#'),
                                    "source": "GitHub",
                                    "snippet": r.get('body', '')[:200]
                                })
                            print(f"[SEARCH SERVICE] ✅ GitHub: {len(gh_results)} resultados")
                        except Exception as e:
                            print(f"[SEARCH SERVICE] ❌ Falha no GitHub: {e}")

            except Exception as e:
                print(f"[SEARCH SERVICE] ❌ Falha geral no DDGS: {e}")
                # Fallback para apenas RSS e mocks
                return SearchService._search_fallback(topic, sources, max_results_per_source)
        else:
            # DDGS não disponível - usa apenas RSS e mocks
            print("[SEARCH SERVICE] ⚠️ DDGS indisponível. Usando fallback com RSS e mocks.")
            return SearchService._search_fallback(topic, sources, max_results_per_source)

        print(f"[SEARCH SERVICE] ✅ Total: {len(results)} resultados")
        return results

    @staticmethod
    def _search_fallback(topic: str, sources: list[str], max_results: int = 5):
        """Fallback quando DDGS não está disponível."""
        results = []
        
        if "Medium" in sources:
            print(f"[SEARCH SERVICE] 🔄 Fallback: RSS do Medium para '{topic}'")
            rss_results = SearchService._search_medium_rss(topic, max_results)
            for r in rss_results:
                results.append(r)
            
            # Se não encontrou via RSS, usa mocks
            if len(rss_results) == 0:
                print(f"[SEARCH SERVICE] 📝 Fallback: Mocks para Medium")
                mock_results = SearchService._get_mock_medium_articles(topic, max_results)
                for r in mock_results:
                    results.append(r)
        
        if "YouTube" in sources:
            # Mock para YouTube
            mock_results = SearchService._get_mock_youtube_videos(topic, max_results)
            for r in mock_results:
                results.append(r)
        
        if "GitHub" in sources:
            # Mock para GitHub
            mock_results = SearchService._get_mock_github_repos(topic, max_results)
            for r in mock_results:
                results.append(r)
        
        return results

    @staticmethod
    def _search_medium_rss(topic: str, max_results: int) -> list:
        """Busca artigos do Medium via RSS feed da tag."""
        results = []
        try:
            # Normaliza o tópico para usar como tag do Medium
            tag = urllib.parse.quote(topic.lower().strip().replace(' ', '-'))
            rss_url = f"https://medium.com/feed/tag/{tag}"
            
            print(f"[SEARCH SERVICE] 📡 Buscando RSS: {rss_url}")
            
            # Adiciona headers para evitar bloqueio
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(rss_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                feed = feedparser.parse(response.content)
                
                for entry in feed.entries[:max_results]:
                    # Limpa a descrição (remove HTML)
                    description = entry.get('summary', '')
                    if description:
                        description = re.sub(r'<[^>]+>', '', description)
                        description = description[:200] + '...' if len(description) > 200 else description
                    
                    results.append({
                        "title": entry.get('title', 'Sem título'),
                        "url": entry.get('link', '#'),
                        "source": "Medium",
                        "snippet": description
                    })
                print(f"[SEARCH SERVICE] ✅ RSS encontrou {len(results)} artigos")
            else:
                print(f"[SEARCH SERVICE] ⚠️ RSS retornou status {response.status_code}")
                
        except Exception as e:
            print(f"[SEARCH SERVICE] ❌ Falha no RSS do Medium: {e}")
        
        return results

    @staticmethod
    def _get_mock_medium_articles(topic: str, max_results: int = 5) -> list:
        """Retorna artigos mock para testes."""
        print(f"[SEARCH SERVICE] 📝 Gerando mocks para '{topic}'")
        mock_articles = [
            {
                "title": f"Guia Completo de {topic} para Iniciantes",
                "url": f"https://medium.com/@exemplo/guia-{topic.replace(' ', '-')}-iniciantes",
                "source": "Medium",
                "snippet": f"Aprenda {topic} do zero com este guia completo. Inclui exercícios práticos."
            },
            {
                "title": f"Dominando {topic}: Técnicas Avançadas",
                "url": f"https://medium.com/@exemplo/dominando-{topic.replace(' ', '-')}-avancado",
                "source": "Medium",
                "snippet": f"Técnicas avançadas e melhores práticas para {topic} em projetos reais."
            },
            {
                "title": f"{topic} na Prática: Projetos Reais",
                "url": f"https://medium.com/@exemplo/{topic.replace(' ', '-')}-pratica",
                "source": "Medium",
                "snippet": f"Construa projetos reais com {topic} e adicione ao seu portfólio."
            },
            {
                "title": f"O Futuro do {topic}: Tendências para 2026",
                "url": f"https://medium.com/@exemplo/futuro-{topic.replace(' ', '-')}-2026",
                "source": "Medium",
                "snippet": f"Descubra as principais tendências e inovações em {topic} para 2026."
            }
        ]
        return mock_articles[:max_results]

    @staticmethod
    def _get_mock_youtube_videos(topic: str, max_results: int = 5) -> list:
        """Retorna vídeos mock para YouTube."""
        return [
            {
                "title": f"Curso de {topic} - Aula 1: Introdução",
                "url": f"https://youtube.com/watch?v={topic.replace(' ', '').lower()}123",
                "source": "YouTube",
                "snippet": f"Primeira aula do curso completo de {topic}."
            },
            {
                "title": f"{topic} Avançado: Técnicas e Ferramentas",
                "url": f"https://youtube.com/watch?v={topic.replace(' ', '').lower()}456",
                "source": "YouTube",
                "snippet": f"Vídeo avançado sobre {topic} com técnicas para especialistas."
            }
        ]

    @staticmethod
    def _get_mock_github_repos(topic: str, max_results: int = 5) -> list:
        """Retorna repositórios mock para GitHub."""
        topic_slug = topic.replace(' ', '-').lower()
        return [
            {
                "title": f"{topic_slug}-examples",
                "url": f"https://github.com/exemplo/{topic_slug}-examples",
                "source": "GitHub",
                "snippet": f"Exemplos práticos de {topic} para iniciantes."
            },
            {
                "title": f"{topic_slug}-tutorial",
                "url": f"https://github.com/exemplo/{topic_slug}-tutorial",
                "source": "GitHub",
                "snippet": f"Tutorial completo de {topic} com código fonte."
            }
        ]