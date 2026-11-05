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

SOURCE_DESCRIPTIONS = {
    "consumer-protection-act-2019": "Explains consumer rights, complaints, and the remedies a commission can order.",
    "ecommerce-rules-2020": "Covers duties of online shops and marketplaces, including refunds and complaint handling.",
    "ecommerce-amendment-2026": "Updates selected obligations for online shopping platforms.",
    "advertising-guidelines-2022": "Explains rules for misleading ads and endorsements.",
    "dark-patterns-guidelines-2023": "Explains shopping tricks such as hidden charges and subscriptions that are difficult to cancel.",
    "commission-jurisdiction-rules-2021": "Explains which level of consumer commission hears an ordinary complaint based on the amount paid.",
    "nch-official-guidance": "Shows how to contact the National Consumer Helpline.",
    "nch-official-faq": "Answers common questions about using the Consumer Helpline.",
    "ejagriti-nic-overview": "Describes the online portal for consumer complaints and case searches.",
    "ejagriti-official-help-links": "Links to official help for using the consumer complaint portal.",
}


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


def show_citation(section, passage, manifest):
    metadata = manifest[passage["source_id"]]
    st.caption(f"{metadata['title']} · {section}")
    page = passage.get("page")
    page_label = f" (PDF page {page})" if page else ""
    st.markdown(f"[Read the official wording]({metadata['official_url']}){page_label}")


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
            source = result["sources"][quote["source"]]
            passage = next(p for p in source["passages"] if quote["text"] in p["text"])
            st.text(quote["text"])
            show_citation(source["section"], passage, manifest)

    for limit in result["limits"]:
        st.caption(limit)
    if result.get("diagnostic"):
        st.caption(result["diagnostic"])
    if result["sources"]:
        st.subheader("Sources")
    for label, source in result["sources"].items():
        with st.expander(f"[{label}] {source['section']}: {source['title']}"):
            for passage in source["passages"]:
                show_citation(source["section"], passage, manifest)
                st.text(passage["text"])


st.set_page_config(page_title="Consumer Law Guide")
st.title("Consumer Law Guide")
st.write("Your consumer rights, straight from the source.")
as_of = current_date()
active_records, manifest = source_metadata(as_of)

with st.container():
    st.caption("Don’t include names, phone numbers, or other personal details.")
    question = st.chat_input("Ask a question about consumer rights", max_chars=600)

if question and question.strip():
    with st.spinner("Searching the sources..."):
        try:
            key = st.secrets.get("GROQ_API_KEY", "")
        except StreamlitSecretNotFoundError:
            key = ""
        selector = partial(groq_select, api_key=key) if key else None
        result = answer(question, *load_pipeline(), as_of, select=selector)
    show_result(result, manifest)

with st.expander("Sources and coverage"):
    by_source = {}
    for record in active_records:
        by_source.setdefault(record["source_id"], set()).add(record["effective_from"])
    for source_id, dates in by_source.items():
        source = manifest[source_id]
        st.markdown(f"**[{source['title']}]({source['official_url']})**")
        st.write(SOURCE_DESCRIPTIONS.get(source_id, "Official source for indexed provisions."))
        st.caption(f"Indexed record effective dates: {', '.join(sorted(dates))}")
    checked = max((record["checked_on"] for record in active_records), default="not available")
    st.caption(f"{len(active_records)} active records as of {as_of}. Latest source check: {checked}.")
    st.markdown("**Not covered:** Individual case outcomes, banking disputes, food-label rules, "
                "privacy, tenancy, or criminal procedure.")

with st.expander("Privacy"):
    st.write("When Groq is enabled and the guide tries to select supporting passages, "
             "it sends the redacted question and source excerpts to Groq. Redaction "
             "only catches some details, such as common email addresses and phone numbers. "
             "Leave out names and private case details.")

st.caption("Not legal advice.")
