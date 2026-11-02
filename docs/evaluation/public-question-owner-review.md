# Public consumer questions: delegated review

Reviewed on **2 November 2026** by the implementation agent at the owner's request.
The delegated eight-row check is complete. It is a post-scoring self-review by the
same agent that selected and labelled the questions, not independent owner
approval or professional legal validation. The owner does not need to repeat this
step to continue development.

The frozen dataset and raw report retain their original `human_review: pending`
metadata as a historical statement. This document records the later delegated
review; it does not turn that metadata into a claim of human approval.

## Method and access limits

Compared the condensed questions with the source-post text and the actual
quotations in [`records.json`](../../data/consumer-law/v1/records.json). Comments
and claimed outcomes were not treated as legal ground truth. Original incidents
and poster identities were not verified.

W01, W04, W13 and W16 were readable as browser page text during this review.
W06, W08 and W12 could not be reopened; those comparisons use indexed text read
during collection, not a fresh live-page verification. W20 was rechecked through
indexed post text. Cached or indexed text can be incomplete or stale, so those
meaning findings remain qualified. No access restriction was bypassed.

## Findings

| ID | Source | Meaning check | Evidence/scope check | Disposition |
| --- | --- | --- | --- | --- |
| W01 | [Watch return dispute](https://www.reddit.com/r/LegalAdviceIndia/comments/1rqsoo4/amazon_india_rejected_my_14999_refund_claiming_i/) | Preserves the original disputed return, NCH escalation and similar-case request. A later author comment reports a refund: this is a retrospective question, not a verified unresolved case. | NCH limits and Commission remedies support the chosen escalation/remedies explanation. Seller-return duties can also be useful; their absence from the gold labels does not make them irrelevant. No record establishes the actual return facts or a similar judgment. | Retain as qualified historical scenario; labels are not exhaustive. |
| W04 | [Subscription charge](https://www.reddit.com/r/IndiaTech/comments/1og9odw/netflix_charged_me_after_cancelling_subscription/) | Preserves the initial cancellation/charge question. The post's edit says support refunded it; the frozen prompt omits that update. The full page is readable now although collection recorded index-only access. | Grievance and deficiency provisions are conditional background, not the only acceptable next-step evidence. The allegation alone does not prove deficient service, an unlawful debit or a dark pattern. App/mandate instructions are absent. | Add a retrospective-scenario note in the next version; do not call the preferred two-record combination the only useful evidence. |
| W06 | [Showroom WhatsApp terms](https://www.reddit.com/r/LegalAdviceIndia/comments/1ga3j5o/) | Correction needed: the collection text refers to an initial sale/contact form and receipt, but does not establish that the form was signed. The frozen prompt adds that fact. | The unfair-contract definition is only background; it does not answer whether WhatsApp terms became part of this contract. Calling it required sufficient evidence for the actual question is too strong. | Remove the unestablished signature fact in a new version. Reassess requested-answer scope separately from optional consumer-law background. |
| W08 | [Expired ice cream](https://www.reddit.com/r/LegalAdviceIndia/comments/1m7tz0p/) | The collected text supports the expiry, FSSAI, e-Jagriti and compensation requests. The underlying food condition is an allegation, not independently established. | Online filing and conditional remedies address only part of the request. Official e-Jagriti help may also support the filing-route part; restricting that group to one overview record is answer-strategy-specific. FSSAI procedure is absent. | Retain partial scope; consider equivalent filing-route records before freezing a new label version. |
| W12 | [Present-address affidavit](https://www.reddit.com/r/LegalAdviceIndia/comments/1wnpoku/consumer_court_ejagriti_can_i_file_a_case_in_my/) | Correction needed: the source also claims the refund-refusal message was received while physically in the current city and asks about proving that fact. The shortened prompt omits this proposed cause-of-action basis. | Territorial jurisdiction is relevant, but does not settle proof or affidavit acceptance. A generic help link supplies navigation, not a verified evidentiary requirement. | Restore the claimed message-receipt location and proof question in a new prompt version. Keep registry acceptance unsupported. |
| W13 | [Appeal-form mismatch](https://www.reddit.com/r/LegalAdviceIndia/comments/1ua1twu/how_to_appeal_district_consumer_commission_order/) | Preserves the District order, challenge to compensation, first-appeal question and requested State-order document mismatch. | The District-to-State appeal record supports the legal-route part. The help record links general complaint-filing resources; it does not verify an appeal checklist or current form. Requiring that exact help card to count a legal-route retrieval as complete is too restrictive. | Retain partial scope; separate legal evidence from optional navigation in a new label version. |
| W16 | [RBI compensation question](https://www.reddit.com/r/LegalAdviceIndia/comments/1urymbd/can_i_claim_rbi_100day_compensation_for_delayed/) | Preserves the failed-payment dates, claimed circular interpretation and compensation request. The prompt correctly presents that interpretation as the poster's question. | The requested RBI circular and applicability evidence are absent. A refund provision mentioning RBI does not supply the missing circular. | Keep unsupported for this corpus; no finding on the actual RBI entitlement is made. |
| W20 | [Jaggery label question](https://www.reddit.com/r/Fitness_India/comments/1wquqnw/doubts_regarding_jaggery_whether_it_is_counted_as/) | The indexed text supports the stated jaggery/zero-added-sugar question. The package image and actual composition were not verified. | Generic advertising principles do not establish the absent FSSAI definitions, exemptions or product compliance. Community replies are not the reference answer. | Keep unsupported for the requested food-labelling determination. |

## Source basis

- [Consumer Protection Act, 2019](https://consumeraffairs.gov.in/public/upload/files/CP%20Act%202019_1732700731.pdf): the checked corpus passages for deficiency, unfair contract, territorial jurisdiction, remedies and District-order appeals.
- [E-Commerce Rules, 2020](https://consumeraffairs.gov.in/public/upload/files/E%20commerce%20rules_1732703966.pdf): the checked grievance and conditional return/refund provisions, not a determination of the disputed transactions.
- [Official NCH FAQ](https://consumerhelpline.gov.in/public/index.php/about): the pre-litigation role and unresolved-grievance route.
- [Official filing/help page](https://grahak.maharashtra.gov.in/en/online-e-filling/): general e-Jagriti filing/help links, not proof of specific affidavit or appeal-document acceptance.

## Effect on the benchmark

Six initial requests are recognisable with the caveats above; two prompts need
factual corrections. Several labels prescribe a preferred explanation/help card
rather than enumerate all useful evidence. These findings weaken interpretation
of the exact completeness counts; they do not establish revised counts or erase
the observed irrelevant retrievals and missing scope gate.

No frozen prompt, label, fingerprint or score was changed, and no favourable
replacement run was selected. A corrected version must document these changes
before scoring and report itself as a revision of an already-seen development
set, not a new unseen test. Until then, the published counts are provisional
checkpoint coverage, not legally validated accuracy.

The [source set](../../evaluation/consumer-web-20.json),
[original protocol](public-question-protocol.md) and
[unchanged run](public-questions-2026-11-02.md) remain available for inspection.
