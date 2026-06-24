-- Phase 4: vector index for similarity search (run after embeddings are populated)
create index if not exists past_projects_embedding_hnsw_idx
  on past_projects
  using hnsw (embedding vector_cosine_ops);
