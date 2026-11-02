# Owner review: public consumer questions

Status: **pending**. No row has been approved by the owner or a legal professional.

For each row, open the original post and check whether the condensed question
preserves its problem. Then inspect the named records in
[`records.json`](../../data/consumer-law/v1/records.json), including their quotations
and official links. You can reply in chat with `W01: agree/disagree/unclear` and a
short reason. This meaning/evidence review does not require a law qualification,
but it is not a substitute for professional legal validation.

Do not approve a row just because the system retrieved its expected record.
If a label is wrong, record an erratum; do not silently change the frozen test.

| ID | Original post | What to check | Expected evidence for the supported part | Owner status |
| --- | --- | --- | --- | --- |
| W01 | [Watch return/refund dispute](https://www.reddit.com/r/LegalAdviceIndia/comments/1rqsoo4/amazon_india_rejected_my_14999_refund_claiming_i/) | Does the prompt retain the contested return and NCH escalation? The corpus cannot prove the seller's allegation or supply a similar judgment. | `nch-prelitigation-limits`, `district-commission-remedies` | Pending |
| W04 | [Charge after subscription cancellation](https://www.reddit.com/r/IndiaTech/comments/1og9odw/) | Is platform grievance guidance useful but incomplete without the actual cancellation/UPI mandate records? This source was accessible through the search index only. | `ecommerce-platform-grievance`, `deficiency-definition` | Pending |
| W06 | [Cancellation fee in WhatsApp terms](https://www.reddit.com/r/LegalAdviceIndia/comments/1ga3j5o/) | Does the prompt preserve an offline showroom transaction? The unfair-contract definition does not establish whether WhatsApp terms were incorporated. | `unfair-contract-definition` | Pending |
| W08 | [Expired grocery delivery](https://www.reddit.com/r/LegalAdviceIndia/comments/1m7tz0p/) | Are both consumer remedies and the separate FSSAI request retained? We have no FSSAI reporting procedure. | `ejagriti-online-filing`, `district-commission-remedies` | Pending |
| W12 | [Present-address affidavit](https://www.reddit.com/r/LegalAdviceIndia/comments/1wnpoku/consumer_court_ejagriti_can_i_file_a_case_in_my/) | Does the prompt preserve the missing address documents and affidavit question? A residence-based jurisdiction rule is not proof the registry will accept an affidavit. | `district-commission-jurisdiction`, `ejagriti-help-resources` | Pending |
| W13 | [District-order appeal form](https://www.reddit.com/r/LegalAdviceIndia/comments/1ua1twu/how_to_appeal_district_consumer_commission_order/) | Does the prompt retain the mismatch between the District order and the portal's requested State order? We cannot verify the current form or certified-copy requirements. | `appeal-district-commission`, `ejagriti-help-resources` | Pending |
| W16 | [RBI delayed-reversal compensation](https://www.reddit.com/r/LegalAdviceIndia/comments/1urymbd/can_i_claim_rbi_100day_compensation_for_delayed/) | Does this need the actual RBI circular rather than generic consumer refund guidance? The poster's interpretation is a question, not an accepted legal fact. | None: requested RBI authority absent | Pending |
| W20 | [Jaggery and added-sugar label](https://www.reddit.com/r/Fitness_India/comments/1wquqnw/doubts_regarding_jaggery_whether_it_is_counted_as/) | Does determining compliance require the absent food-labelling definitions? A general advertising provision alone cannot decide it. | None: requested FSSAI authority absent | Pending |

The source set and all prompts are in
[`consumer-web-20.json`](../../evaluation/consumer-web-20.json).
The [protocol](public-question-protocol.md) explains selection, privacy handling
and why complete labelled evidence does not mean a complete legal answer.
