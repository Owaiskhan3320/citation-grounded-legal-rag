# Unseen Evaluation Set 1

This is a 20-question manual evaluation set for the deployed application. It was written on 30 October 2026 before the app was queried with these prompts. The implementation remains frozen while this set is run.

The questions deliberately use different wording and scenarios from the 50-question regression suite. They still test the current, narrow corpus: the Consumer Protection Act, 2019; the Consumer Protection (E-Commerce) Rules, 2020; the 2022 misleading-advertisement guidance; and the 2023 dark-pattern guidance.

## Protocol

1. Submit each exact question once through the deployed app.
2. Retain the first completed result. Do not retry a response because it is more favourable.
3. Record whether the answer was generated or a retrieval fallback.
4. Grade the answer against the listed core checkpoint and displayed source cards.
5. Do not alter the implementation until the completed scorecard is committed.

`Pass` means the core checkpoint is answered correctly with relevant evidence. `Partial` means a meaningful part is correct but required detail is missing or misleading. `Fail` means the core question is not answered. This evaluates a focused source corpus; it is not overall legal accuracy or legal advice.

## Primary Sources

- [Consumer Protection Act, 2019](https://www.indiacode.nic.in/bitstream/123456789/15256/1/a2019-35.pdf)
- [Consumer Protection (E-Commerce) Rules, 2020](https://consumeraffairs.nic.in/sites/default/files/E%20commerce%20rules_0.pdf)
- [CCPA guidelines index](https://ccpa.doca.gov.in/guidelines)
- [Dark Patterns Guidelines, 2023](https://ccpa.doca.gov.in/files/The%20Guidelines%20for%20Prevention%20and%20Regulation%20of%20Dark%20Patterns%2C%202023_1732707717.pdf)

## Questions And Core Checkpoints

| ID | Family | Exact question | Core checkpoint | Primary source |
| --- | --- | --- | --- | --- |
| U01 | Act | A buyer writes to seek a product-liability remedy after a defective appliance causes loss. Can that written allegation fall within the Act's definition of a complaint? | A complaint is a written allegation seeking relief under the Act; product liability is one covered category. | Act, section 2(6) |
| U02 | Act | A trader promotes a service using deceptive methods and false representations. Can this be an unfair trade practice under the Consumer Protection Act, 2019? | The definition covers practices used to promote sale, use, or supply of goods or services through unfair or deceptive methods, including specified false or misleading representations. | Act, section 2(47) |
| U03 | Act | Can the Central Consumer Protection Authority issue a safety notice to alert consumers about a hazardous product or service? | The Authority's functions include issuing safety notices to alert consumers against hazardous or unsafe goods or services. | Act, section 18 |
| U04 | Act | After an investigation finds evidence that a service is unsafe, can the Central Authority order withdrawal of that service and reimbursement to purchasers? | The Authority may order withdrawal of unsafe services and reimbursement of prices to purchasers where the statutory conditions are met. | Act, section 20 |
| U05 | Act | After a defective-goods complaint is admitted, what response period does the opposite party ordinarily receive, and what extension can the District Commission allow? | The complaint is sent to the opposite party within 21 days; the response period is 30 days with a possible extension of up to 15 days. | Act, section 38 |
| U06 | E-Commerce | Do the E-Commerce Rules cover goods and services bought or sold through digital or electronic networks across marketplace and inventory models? | The Rules apply to goods and services bought or sold over digital or electronic networks, including marketplace and inventory models and e-commerce retail. | E-Commerce Rules, rule 2 |
| U07 | E-Commerce | Must an e-commerce platform show its legal name, headquarters or branch address, website details, and customer-care or grievance contact information? | The platform must prominently provide its legal name, principal geographic addresses, website details, and customer-care and grievance contact details, including email and telephone numbers. | E-Commerce Rules, rule 4(2) |
| U08 | E-Commerce | When an online marketplace ranks goods or sellers, does it need to explain the main ranking parameters to consumers? | The marketplace must provide an explanation of the main parameters that determine ranking of goods or sellers. | E-Commerce Rules, rule 5 |
| U09 | E-Commerce | Can a marketplace seller pose as an ordinary consumer, publish its own reviews, or misrepresent a product's quality or features? | A marketplace seller must not adopt an unfair trade practice, falsely present itself as a consumer, post reviews as a consumer, or misrepresent quality or features. | E-Commerce Rules, rule 6(1)-(2) |
| U10 | E-Commerce | What information about charges and complaint tracking should an inventory e-commerce entity make available to a consumer before purchase? | It must provide clear information about fees or charges, total price with compulsory and voluntary charges, charge-back options, and a complaint ticket number for tracking. | E-Commerce Rules, rule 7(1) |
| U11 | Advertisements | Can an advertisement be treated as valid if it overstates the scientific validity or performance of a product? | A valid, non-misleading advertisement must be truthful and honest and must not exaggerate accuracy, scientific validity, usefulness, capability, or performance. | 2022 Advertisement Guidelines, clause 3 |
| U12 | Advertisements | A disclaimer is placed in tiny, unclear text and hides that content is paid promotion. What limits do the Guidelines place on that disclaimer? | A disclaimer must not hide material information or commercial intent; it should use the claim's language and font and must not be unclear or inconspicuous. | 2022 Advertisement Guidelines, clause 4 |
| U13 | Advertisements | An offer at a very low price is advertised for only a few units, but the ad does not disclose the shortage. What must a bait advertisement make clear? | Where demand is expected to exceed available stock, the advertisement must clearly state the stock limitation and have a reasonable prospect of availability at the advertised price. | 2022 Advertisement Guidelines, clause 5 |
| U14 | Advertisements | An influencer is paid by an advertiser, but viewers would not reasonably expect the relationship. What disclosure and care are required before the endorsement? | The endorsement must be based on due diligence and a genuine, reasonably current opinion based on adequate information or experience; an unexpected material connection must be disclosed. | 2022 Advertisement Guidelines, clause 13 |
| U15 | Advertisements | Can an advertisement aimed at children exploit their lack of experience or make an unsupported health-benefit claim? | It must not exploit a child's vulnerability or lack of experience; health or nutritional claims require adequate scientific substantiation by a recognised body. | 2022 Advertisement Guidelines, clause 7 |
| U16 | Dark patterns | An app makes users enter payment details and accept auto-debit before they can start a free subscription. Which dark-pattern category is relevant? | Forcing payment details or auto-debit authorisation for a free subscription is a subscription trap. | 2023 Dark Patterns Guidelines, Annexure 1 |
| U17 | Dark patterns | A platform adds a paid service through a pre-ticked box while a customer checks out. Which dark pattern should be considered? | Adding an extra product or service without consent so the payable amount increases is basket sneaking. | 2023 Dark Patterns Guidelines, Annexure 1 |
| U18 | Dark patterns | A service marketed as free only reveals later that continued use requires an in-app payment. Which dark pattern should be considered? | Hiding a later in-app cost for continued use of a service advertised as free is drip pricing. | 2023 Dark Patterns Guidelines, Annexure 1 |
| U19 | Dark patterns | A sponsored post is styled to look like an independent news story or user review so people click it as if it were ordinary content. Which dark pattern fits? | Masking an advertisement as user-generated content, news, or other interface content is a disguised advertisement. | 2023 Dark Patterns Guidelines, Annexure 1 |
| U20 | Dark patterns | A seller advertises a low-priced item but then tells the buyer it is unavailable and pushes a similar, more expensive item. Which dark pattern fits? | Advertising one outcome while deceptively steering the user to another, such as a more expensive product, is bait and switch. | 2023 Dark Patterns Guidelines, Annexure 1 |

## Day 3 Scorecard

| ID | Mode | Retrieval | Grade | Citation/card support | Notes |
| --- | --- | --- | --- | --- | --- |
| U01 |  |  |  |  |  |
| U02 |  |  |  |  |  |
| U03 |  |  |  |  |  |
| U04 |  |  |  |  |  |
| U05 |  |  |  |  |  |
| U06 |  |  |  |  |  |
| U07 |  |  |  |  |  |
| U08 |  |  |  |  |  |
| U09 |  |  |  |  |  |
| U10 |  |  |  |  |  |
| U11 |  |  |  |  |  |
| U12 |  |  |  |  |  |
| U13 |  |  |  |  |  |
| U14 |  |  |  |  |  |
| U15 |  |  |  |  |  |
| U16 |  |  |  |  |  |
| U17 |  |  |  |  |  |
| U18 |  |  |  |  |  |
| U19 |  |  |  |  |  |
| U20 |  |  |  |  |  |
