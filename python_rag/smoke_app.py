"""Week 1 hosting check, not the public question-answering app."""

import streamlit as st

from python_rag.retrieval import build_index, current_date, load_model, search


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
