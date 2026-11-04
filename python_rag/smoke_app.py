"""Week 1 hosting check, not the public question-answering app."""

from pathlib import Path
import sys

import streamlit as st

# Streamlit can launch this nested entrypoint without the repo root on sys.path.
repo_root = str(Path(__file__).resolve().parents[1])
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

try:
    from python_rag.retrieval import build_index, current_date, load_model, search
except ModuleNotFoundError as error:
    runtime = ".".join(map(str, sys.version_info[:3]))
    st.error(f"Retrieval import failed on Python {runtime}: missing module {error.name!r}.")
    st.stop()


@st.cache_resource
def startup():
    model = load_model()
    index, records = build_index(model)
    return index.ntotal, search("The checkout box was already ticked", model, index, records, current_date())


st.title("Python retrieval smoke test")
with st.spinner("Loading MiniLM and building the FAISS index..."):
    row_count, results = startup()
st.success(f"Loaded MiniLM and searched {row_count} FAISS rows.")
for record, score in results:
    st.text(f"{score:.4f}  {record['section']}  {record['title']}")
