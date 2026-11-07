"""Recorded answer evaluation results shown in the Streamlit guide."""

import streamlit as st


REPORTS = "https://github.com/Owaiskhan3320/citation-grounded-legal-rag/blob/main/docs/evaluation"
# These are dated benchmark snapshots, not measurements of the currently running app.
RUNS = (
    ("6 Nov · hosted regression", 50, 43, 2, 5),
    ("7 Nov · local regression with Groq", 50, 48, 2, 0),
    ("6 Nov · hosted holdout v1", 25, 18, 5, 2),
    ("7 Nov · additional rubric cases", 15, 13, 2, 0),
)
STYLE = """
<style>
.st-key-evaluation-runs table { width: 100%; table-layout: fixed; }
.st-key-evaluation-runs th:first-child { width: 52%; }
.st-key-evaluation-runs th, .st-key-evaluation-runs td { overflow-wrap: anywhere; }
@media (max-width: 600px) {
    .st-key-evaluation-runs th, .st-key-evaluation-runs td { padding: 0.4rem; }
    .st-key-evaluation-metrics [data-testid="stHorizontalBlock"] { flex-wrap: nowrap; gap: 0.35rem; }
    .st-key-evaluation-metrics [data-testid="stColumn"] { flex: 1 1 0; min-width: 0; }
    .st-key-evaluation-metrics [data-testid="stMetric"] { padding: 0.45rem; }
    .st-key-evaluation-metrics [data-testid="stMetricValue"] { font-size: 1.3rem; }
}
</style>
"""


@st.dialog("Evaluation", width="large")
def show_evaluation():
    st.html(STYLE)
    st.write("How the guide performed on recorded tests of its answers, source links, and handling of unsupported questions.")

    _, total, passed, partial, failed = RUNS[1]
    st.caption("50-question regression · 7 November 2026 · local integration test with Groq")
    with st.container(key="evaluation-metrics"):
        pass_card, partial_card, fail_card = st.columns(3)
        pass_card.metric("Passed", f"{passed}/{total}", border=True)
        partial_card.metric("Partial", partial, border=True)
        fail_card.metric("Failed", failed, border=True)

    st.subheader("Recorded runs")
    with st.container(key="evaluation-runs"):
        rows = ["| Run | Passed | Partial | Failed |", "| --- | ---: | ---: | ---: |"]
        rows.extend(f"| {run} | {passed}/{total} | {partial} | {failed} |"
                    for run, total, passed, partial, failed in RUNS)
        st.markdown("\n".join(rows))
    st.caption("The first two runs used the same 50 questions. The holdout and additional cases are separate sets.")

    st.subheader("How to read the results")
    st.write("A pass means the answer met the rubric, or the guide correctly declined an unsupported question. "
             "A partial answer missed a detail or included unnecessary material. "
             "These results describe fixed test sets, not overall legal accuracy or independent legal validation.")
    st.markdown(f"[Hosted regression]({REPORTS}/live-guide-full-retest-results.md) · "
                f"[Local regression]({REPORTS}/guide-release-candidate-live.md) · "
                f"[Holdout report]({REPORTS}/guide-holdout-v1-results.md) · "
                f"[Scoring rubric]({REPORTS}/guide-holdout-rubric-v1.md)")
