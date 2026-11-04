"""Streamlit entrypoint for the consumer-law guide."""

from functools import partial
import json
from pathlib import Path
import sys

import streamlit as st
from streamlit.errors import StreamlitSecretNotFoundError

repo_root = str(Path(__file__).resolve().parents[1])
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

from python_rag.answer import answer, groq_select
from python_rag.retrieval import CORPUS, active, build_index, corpus_snapshot, current_date, load_model


@st.cache_data
def source_metadata(as_of):
    records, _ = corpus_snapshot()
    records = [record for record in records if active(record, as_of)]
    manifest = json.loads(CORPUS.with_name("sources.json").read_text(encoding="utf-8"))
    return records, {source["id"]: source for source in manifest["sources"]}


@st.cache_resource
def load_pipeline():
    model = load_model()
    index, records = build_index(model)
    return model, index, records


def show_result(result, manifest):
    mode = result["mode"]
    if mode == "not_verified":
        st.warning("No verified answer from the indexed sources.")
    elif mode == "partial":
        st.warning("Limited source coverage. These excerpts do not answer every part.")
    elif mode == "excerpts":
        st.info("Candidate excerpts only. Their relevance has not been verified.")
    else:
        st.subheader("Selected source quotes")
        for quote in result["quotes"]:
            st.text(f"[{quote['source']}] {quote['text']}")

    for limit in result["limits"]:
        st.caption(limit)
    if result.get("diagnostic"):
        st.caption(result["diagnostic"])
    if result["sources"]:
        st.subheader("Sources")
    for label, source in result["sources"].items():
        with st.expander(f"[{label}] {source['section']}: {source['title']}"):
            for passage in source["passages"]:
                metadata = manifest[passage["source_id"]]
                page = passage.get("page")
                page_label = f", PDF page {page}" if page else ""
                st.markdown(f"[{metadata['title']}]({metadata['official_url']}){page_label}")
                st.text(passage["text"])


st.set_page_config(page_title="Consumer Law Guide")
st.title("Consumer Law Guide")
st.write("Look up Indian consumer-law provisions and read the official sources.")
as_of = current_date()
active_records, manifest = source_metadata(as_of)

with st.expander("What can this answer?"):
    by_source = {}
    for record in active_records:
        by_source.setdefault(record["source_id"], set()).add(record["effective_from"])
    for source_id, dates in by_source.items():
        source = manifest[source_id]
        st.markdown(f"- [{source['title']}]({source['official_url']})"
                    f" (record effective dates: {', '.join(sorted(dates))})")
    checked = max((record["checked_on"] for record in active_records), default="not available")
    st.caption(f"{len(active_records)} active records as of {as_of}. Latest source check: {checked}.")
    st.markdown("**Not covered:** Individual case outcomes, banking disputes, food-label rules, "
                "privacy, tenancy, or criminal procedure.")

st.caption("Do not enter names, phone numbers, or private case details. "
           "When enabled, the app sends the redacted question and source excerpts to Groq.")
with st.form("ask"):
    question = st.text_area("Ask a question", max_chars=600,
                            placeholder="e.g. An online seller refuses a refund for a damaged item.")
    submitted = st.form_submit_button("Ask")

if submitted:
    if question.strip():
        with st.spinner("Searching the sources..."):
            try:
                key = st.secrets.get("GROQ_API_KEY", "")
            except StreamlitSecretNotFoundError:
                key = ""
            selector = partial(groq_select, api_key=key) if key else None
            result = answer(question, *load_pipeline(), as_of, select=selector)
        show_result(result, manifest)
    else:
        st.info("Enter a question first.")

st.caption("Not legal advice.")
