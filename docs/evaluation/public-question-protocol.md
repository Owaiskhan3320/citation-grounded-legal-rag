# Public consumer questions: collection protocol

Collected on 2 November 2026, before scoring. This supplements the agent-authored
50-question experiment; it does not replace or relabel that historical run.

## Selection

Twenty distinct public Reddit posts: fifteen practical consumer disputes with
some source-supported content, plus five neighbouring-domain questions for which
the requested authority is absent. Search topics were refunds/defective goods,
subscriptions, cancellation terms, delayed service, NCH, filing/appeals, banking,
privacy, tenancy and food labels. Selection used topic and source readability,
not retrieval output. This is a convenience sample, not a random user study.

One scenario per post/incident. Cross-posts were excluded, including duplicate
retailer-refund and appeal threads. Removed posts, UK/Australian advice threads,
promotional explainers and narratives without a practical question were excluded.
The faulty-RAM example shown during planning was not reused. The news-renewal post
was previously shown as an example, which is disclosed rather than called unseen.

The source question and scenario were authored outside this project; the precise
evaluation prompt is agent-condensed and anonymised. Do not claim these are 20
verbatim user prompts, independently verified human authors, expert-validated
labels or guaranteed-unseen LLM inputs. Facts and allegations are not verified.

Source access is recorded individually as `page_text` or `search_index`. The former
means the browser tool returned a readable page, possibly cached, not a guarantee
that the page is still live. The latter means only indexed post text was readable.
There is no fabricated original-page hash or invented live-check timestamp.

Only short question excerpts and paraphrased context are retained. No usernames,
order IDs, contact details, screenshots or complete post bodies are stored. Brand
names in short provenance excerpts are attribution, not findings against a company.
Source URLs remain linkable and may themselves lead to personal details; do not
copy those details into the review sheet. No comments are treated as legal truth.

## What can be scored

All fifteen positive examples are **partly answerable as written**. Their practical
requests include disputed evidence, outcome predictions, document checklists,
current portal behaviour or other missing material. None is labelled fully
answerable. Required evidence groups score only the explicitly described supported
part. A complete evidence score therefore does not mean a complete user answer.

The five negative examples require missing banking, privacy, medical-record,
tenancy or FSSAI authorities. General consumer provisions do not answer those
specific requests, even where a consumer grievance route might also exist.

Each checkpoint and unsupported-request note was checked against the existing
official quotations, not the Reddit replies. This is agent source checking, not
professional legal validation. Eight representative rows will be prepared for the
owner's review, and remain marked pending until actually reviewed.

## Freeze and comparison

Commit questions, labels and fingerprints before scoring. Keep production code,
corpus, document fields, BM25 settings, pinned MiniLM revision, fusion constant and
three-record limit unchanged from Week 3. Do not add these posts to the RAG corpus.
Run each method once for the first result. Later reruns are reproducibility checks,
not opportunities to replace an unfavourable result.

Reuse the existing evaluator and metric implementations without modifying them or
the historical 50-question report. The small new adapter accepts this 20-question
source format. CI reruns keyword/BM25 only; embeddings remain local and optional.
Record per-question results, artifact/scorer hashes, timing and every failure.
Do not fit an abstention threshold on this test set.

Report supported-part evidence coverage separately from whole-question coverage,
which is not measured. Negative-result false matches are candidate retrievals, not
proof of hallucinated answers. No live Groq calls or generated-answer grading are
included. Owner review and professional legal validation remain pending.
