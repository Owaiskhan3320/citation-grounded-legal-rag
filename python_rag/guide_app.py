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

from python_rag.answer import answer, groq_select, redact
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

CONSUMER_RIGHTS = (
    "**Safety:** Be protected from the marketing of goods or services that can harm people or property.",
    "**Information:** Know what you're paying for, including its quality, quantity, strength, purity, standards and price.",
    "**Choice:** Have access to a variety of goods or services at competitive prices, wherever possible.",
    "**Being heard:** Have the appropriate body listen to and consider your concerns.",
    "**A remedy:** Seek help to put things right if you face unfair or restrictive business practices or exploitation.",
    "**Awareness:** Learn about your rights as a consumer.",
)


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


def show_source(source, manifest):
    by_document = {}
    for passage in source["passages"]:
        pages = by_document.setdefault(passage["source_id"], set())
        if passage.get("page"):
            pages.add(passage["page"])
    for source_id, pages in by_document.items():
        metadata = manifest[source_id]
        st.caption(f"{metadata['title']} · {source['section']}")
        page_label = ""
        if pages:
            unit = "page" if len(pages) == 1 else "pages"
            page_label = f" (PDF {unit} {', '.join(map(str, sorted(pages)))})"
        st.markdown(f"[Read the official wording]({metadata['official_url']}){page_label}")
    with st.expander(f"Source excerpts: {source['title']}"):
        for passage in source["passages"]:
            if passage.get("page"):
                st.caption(f"PDF page {passage['page']}")
            st.text(passage["text"])


def show_summaries(sources, records):
    for source in sources:
        record = records[source["record_id"]]
        if len(sources) > 1:
            st.markdown(f"**{source['title']}**")
        if record["id"] == "consumer-rights":
            st.write("You have six main rights as a consumer:")
            st.markdown("\n".join(f"- {right}" for right in CONSUMER_RIGHTS))
        else:
            st.write(record["summary"])


def show_result(result, manifest, records):
    mode = result["mode"]
    sources = result["sources"]
    parts = result["parts"]
    if mode == "not_verified":
        st.warning("No verified answer from the indexed sources.")
    elif mode == "partial":
        st.warning("Limited source coverage. Some parts could not be verified.")
    elif mode == "excerpts":
        st.info("Candidate excerpts only. Their relevance has not been verified.")

    selected, candidates = {}, {}
    if result["quotes"]:
        st.subheader("Short answer")
    for part in parts.values():
        if len(parts) > 1:
            st.text(part["question"])
        if part["quotes"]:
            labels = dict.fromkeys(quote["source"] for quote in part["quotes"])
            show_summaries([sources[label] for label in labels], records)
            selected.update(labels)
        else:
            if part["limit"]:
                st.caption(part["limit"])
            elif len(parts) > 1:
                st.caption("Only candidate excerpts are available for this part.")
            candidates.update(dict.fromkeys(part["source_ids"]))
    if result.get("diagnostic"):
        st.caption(result["diagnostic"])

    if selected:
        st.subheader("Sources")
        for label in selected:
            show_source(sources[label], manifest)
    remaining = [label for label in candidates if label not in selected]
    if remaining:
        st.subheader("Candidate sources")
        for label in remaining:
            show_source(sources[label], manifest)


st.set_page_config(page_title="Consumer Law Guide")
st.title("Consumer Law Guide")
st.write("Your consumer rights, straight from the source.")
as_of = current_date()
active_records, manifest = source_metadata(as_of)

with st.container():
    st.caption("Don’t include names, phone numbers, or other personal details.")
    question = st.chat_input("Ask a question about consumer rights", max_chars=600)

submitted = (question or "").strip()
if submitted:
    st.session_state["guide_question"] = redact(submitted)
    st.session_state.pop("guide_result", None)

if "guide_question" in st.session_state:
    with st.chat_message("user"):
        st.text(st.session_state["guide_question"])

if submitted:
    with st.spinner("Searching the sources..."):
        try:
            key = st.secrets.get("GROQ_API_KEY", "")
        except StreamlitSecretNotFoundError:
            key = ""
        selector = partial(groq_select, api_key=key) if key else None
        result = answer(submitted, *load_pipeline(), as_of, select=selector)
        st.session_state["guide_result"] = (result, as_of)

if "guide_result" in st.session_state:
    result, result_date = st.session_state["guide_result"]
    result_records, _ = source_metadata(result_date)
    with st.chat_message("assistant"):
        show_result(result, manifest, {r["id"]: r for r in result_records})

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
