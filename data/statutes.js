const OFFICIAL_ACT_URL =
  "https://www.indiacode.nic.in/bitstream/123456789/15256/1/a2019-35.pdf";
const E_COMMERCE_RULES_URL =
  "https://consumeraffairs.nic.in/sites/default/files/E%20commerce%20rules_0.pdf";
const E_COMMERCE_RULES_NAME = "Consumer Protection (E-Commerce) Rules, 2020";
const MISLEADING_AD_GUIDELINES_URL =
  "https://consumeraffairs.nic.in/latestnews/guidelines-prevention-misleading-advertisements-and-endorsements-misleading";
const MISLEADING_AD_GUIDELINES_NAME =
  "Guidelines for Prevention of Misleading Advertisements and Endorsements, 2022";
const DARK_PATTERNS_GUIDELINES_URL =
  "https://consumeraffairs.nic.in/sites/default/files/The%20Guidelines%20for%20Prevention%20and%20Regulation%20of%20Dark%20Patterns%2C%202023.pdf";
const DARK_PATTERNS_GUIDELINES_NAME =
  "Guidelines for Prevention and Regulation of Dark Patterns, 2023";

export const statutes = [
  {
    id: "complaint-definition",
    section: "Section 2(6)",
    title: "Meaning of complaint",
    summary:
      "A complaint is a written allegation by an eligible complainant seeking relief under the Act for matters such as unfair trade practices, defective goods, deficient services, overcharging, unsafe goods or services, or product liability.",
    excerpt:
      "A complaint means an allegation in writing made by a complainant for obtaining relief under the Act. It may concern an unfair, restrictive or deceptive practice, defects in goods, deficiency in services, excessive pricing, hazardous goods or services, or a product liability claim.",
    keywords: [
      "what is a complaint",
      "meaning of complaint",
      "eligible complaint",
      "defective goods",
      "deficient service",
      "overcharging",
      "section 2(6)",
      "2(6)",
    ],
    sourceUrl: OFFICIAL_ACT_URL,
  },
  {
    id: "consumer-definition",
    section: "Section 2(7)",
    title: "Meaning of consumer",
    summary:
      "A consumer includes a person who buys goods or hires or avails services for consideration, including in covered online transactions, but generally excludes resale or commercial-purpose purchases.",
    excerpt:
      "A consumer buys goods or hires or avails services for consideration, including a permitted user or beneficiary. The definition excludes a person who obtains goods for resale or a commercial purpose, while preserving the self-employment livelihood exception. It includes covered online, teleshopping, direct-selling and multi-level-marketing transactions.",
    keywords: [
      "who is a consumer",
      "meaning of consumer",
      "consumer definition",
      "commercial purpose",
      "resale",
      "online transaction",
      "section 2(7)",
      "2(7)",
    ],
    sourceUrl: OFFICIAL_ACT_URL,
  },
  {
    id: "consumer-rights",
    section: "Section 2(9)",
    title: "Consumer rights",
    summary:
      "The Act recognises rights to safety, information, choice, being heard, redressal, and consumer awareness.",
    excerpt:
      "Consumer rights include protection against hazardous goods and services; information about quality, quantity, potency, purity, standard and price; access to a variety of goods or services at competitive prices; being heard; redressal against unfair or restrictive trade practices and exploitation; and consumer awareness.",
    keywords: [
      "consumer rights",
      "right to safety",
      "right to information",
      "right to choice",
      "right to be heard",
      "right to redressal",
      "consumer awareness",
      "section 2(9)",
      "2(9)",
    ],
    sourceUrl: OFFICIAL_ACT_URL,
  },
  {
    id: "class-complaints-to-authorities",
    section: "Section 17",
    title: "Complaints to authorities",
    summary:
      "A complaint about consumer-rights violations, unfair trade practices, or false or misleading advertisements affecting consumers as a class may be sent in writing or electronically to the District Collector, a regional-office Commissioner, or the Central Authority.",
    excerpt:
      "A complaint relating to a violation of consumer rights, an unfair trade practice, or a false or misleading advertisement that is prejudicial to consumers as a class may be forwarded in writing or electronic mode to the District Collector, the Commissioner of a regional office, or the Central Authority.",
    keywords: [
      "complaint to central authority",
      "class complaint",
      "consumer rights violation",
      "district collector complaint",
      "electronic complaint authority",
      "section 17",
    ],
    sourceUrl: OFFICIAL_ACT_URL,
  },
  {
    id: "ccpa-functions",
    section: "Section 18",
    title: "Powers and functions of the Central Authority",
    summary:
      "The Central Consumer Protection Authority protects consumer rights as a class, works to prevent unfair trade practices and false or misleading advertisements, and may inquire into violations, file complaints, issue safety notices, and issue guidelines.",
    excerpt:
      "The Central Authority is to protect, promote and enforce consumers' rights as a class; prevent unfair trade practices; and ensure that false or misleading advertisements are not made or published. Its functions include inquiry or investigation, filing complaints, safety notices, consumer-rights awareness and guidelines to prevent unfair trade practices.",
    keywords: [
      "ccpa powers",
      "central consumer protection authority functions",
      "central authority functions",
      "consumer safety notice",
      "prevent unfair trade practice",
      "section 18",
    ],
    sourceUrl: OFFICIAL_ACT_URL,
  },
  {
    id: "ccpa-investigation",
    section: "Section 19",
    title: "Preliminary inquiry and investigation by the Central Authority",
    summary:
      "After receiving information, a complaint, government directions, or acting on its own motion, the Central Authority may conduct a preliminary inquiry and, where there is a prima facie case, direct an investigation or refer the matter to another regulator.",
    excerpt:
      "The Central Authority may conduct or cause a preliminary inquiry into a possible consumer-rights violation, unfair trade practice, or false or misleading advertisement. If a prima facie case exists, it may cause an investigation by the Director-General or District Collector, or refer a matter within another regulator's remit to that regulator.",
    keywords: [
      "ccpa investigation",
      "central authority investigation",
      "preliminary inquiry",
      "prima facie case",
      "refer to regulator",
      "section 19",
    ],
    sourceUrl: OFFICIAL_ACT_URL,
  },
  {
    id: "unsafe-goods-recall",
    section: "Section 20",
    title: "Recall of goods and withdrawal of services",
    summary:
      "After investigation, the Central Authority may order recall of dangerous, hazardous or unsafe goods, withdrawal of unsafe services, reimbursement to purchasers, or discontinuation of unfair practices, after giving the affected person an opportunity to be heard.",
    excerpt:
      "Where investigation provides sufficient evidence of a consumer-rights violation or unfair trade practice, the Central Authority may order recall of dangerous, hazardous or unsafe goods; withdrawal of unsafe services; reimbursement of prices to purchasers; or discontinuation of unfair practices prejudicial to consumers' interests.",
    keywords: [
      "recall unsafe goods",
      "hazardous product recall",
      "withdraw unsafe service",
      "refund recalled product",
      "ccpa recall powers",
      "section 20",
    ],
    sourceUrl: OFFICIAL_ACT_URL,
  },
  {
    id: "misleading-advertisements",
    section: "Section 21",
    title: "Directions and penalties for false or misleading advertisements",
    summary:
      "The Central Authority may direct a false or misleading advertisement to be discontinued or modified, and may impose statutory penalties in applicable cases.",
    excerpt:
      "Where the Central Authority is satisfied after investigation that an advertisement is false or misleading and prejudicial to the interest of any consumer, it may direct the trader, manufacturer, endorser, advertiser or publisher to discontinue or modify the advertisement within a specified time. The section also provides for penalties and, in applicable cases, restrictions on endorsers.",
    keywords: [
      "misleading advertisement",
      "false advertisement",
      "false or misleading",
      "central authority",
      "ccpa",
      "advertiser",
      "endorser",
      "section 21",
      "penalty advertisement",
    ],
    sourceUrl: OFFICIAL_ACT_URL,
  },
  {
    id: "unfair-trade-practice",
    section: "Section 2(47)",
    title: "Unfair trade practice",
    summary:
      "The Act defines unfair trade practices, including misleading representations and specified deceptive practices connected with the sale or supply of goods and services.",
    excerpt:
      "An unfair trade practice includes a trade practice adopted for promoting the sale, use or supply of goods or services that uses unfair or deceptive methods or practices, including specified false or misleading representations.",
    keywords: [
      "unfair trade practice",
      "deceptive practice",
      "misrepresentation",
      "false representation",
      "section 2(47)",
      "2(47)",
    ],
    sourceUrl: OFFICIAL_ACT_URL,
  },
  {
    id: "false-or-misleading-advertisement-definition",
    section: "Section 2(28)",
    title: "Meaning of false or misleading advertisement",
    summary:
      "A false or misleading advertisement includes one that falsely describes a product or service, is likely to mislead consumers about it, makes a representation amounting to an unfair trade practice, or deliberately conceals important information.",
    excerpt:
      "A false or misleading advertisement includes an advertisement that falsely describes a product or service; gives a false guarantee or is likely to mislead consumers about its nature, substance, quantity, quality or standard; conveys a representation that would amount to an unfair trade practice; or deliberately conceals important information.",
    keywords: [
      "false or misleading advertisement definition",
      "misleading advertisement definition",
      "concealing important information",
      "hides material condition advertisement",
      "section 2(28)",
      "2(28)",
    ],
    sourceUrl: OFFICIAL_ACT_URL,
  },
  {
    id: "filing-complaint",
    section: "Section 35",
    title: "Manner in which complaint shall be made",
    summary:
      "An eligible complainant may file a consumer complaint before the District Commission, including electronically in the manner prescribed by the Act and rules.",
    excerpt:
      "A complaint may be filed by a consumer, a recognised consumer association, one or more consumers with the same interest, the Central Authority, or the appropriate Government. The Act provides for filing before the District Commission and permits electronic filing in the prescribed manner.",
    keywords: [
      "file complaint",
      "filing complaint",
      "consumer complaint",
      "district commission",
      "how to complain",
      "section 35",
      "electronic filing",
      "e filing",
    ],
    sourceUrl: OFFICIAL_ACT_URL,
  },
  {
    id: "district-commission-jurisdiction",
    section: "Section 34",
    title: "Jurisdiction of District Commission",
    summary:
      "A complaint may be filed before a District Commission with the required jurisdiction, including where the opposite party is located, the cause of action arises, or the complainant resides or personally works for gain, subject to the Act and applicable rules.",
    excerpt:
      "A complaint may be instituted before a District Commission within whose local limits the opposite party resides, carries on business or works for gain; the cause of action wholly or partly arises; or the complainant resides or personally works for gain. The Act also provides a value-based jurisdictional condition.",
    keywords: [
      "where to file complaint",
      "district commission jurisdiction",
      "complainant residence jurisdiction",
      "consumer forum location",
      "cause of action",
      "section 34",
    ],
    sourceUrl: OFFICIAL_ACT_URL,
  },
  {
    id: "complaint-procedure",
    section: "Section 38",
    title: "Procedure on admission of complaint",
    summary:
      "After admitting a complaint, the District Commission follows the Act's procedure for obtaining the opposite party's version and, where required, considering testing of goods or other evidence before making an order.",
    excerpt:
      "For a complaint concerning goods, the District Commission sends a copy of the admitted complaint to the opposite party within twenty-one days and directs a response within thirty days, with a possible extension of up to fifteen days. The Act also sets out procedures for laboratory testing of alleged defects and for complaints concerning services.",
    keywords: [
      "complaint procedure",
      "after complaint admission",
      "opposite party response",
      "district commission process",
      "laboratory testing goods",
      "section 38",
    ],
    sourceUrl: OFFICIAL_ACT_URL,
  },
  {
    id: "district-commission-remedies",
    section: "Section 39",
    title: "Findings and orders of District Commission",
    summary:
      "If a complaint is proved, the District Commission may grant remedies including removal of defects, replacement, refund, compensation, discontinuation of unfair practices, corrective advertising, and costs, as applicable.",
    excerpt:
      "Where allegations in a complaint are proved, the District Commission may order removal of defects, replacement of goods, refund of the price or charges paid, compensation, discontinuation of unfair or restrictive practices, corrective advertising to neutralise a misleading advertisement, and adequate costs, among other orders specified by the Act.",
    keywords: [
      "consumer complaint remedy",
      "district commission order",
      "refund compensation replacement",
      "corrective advertisement",
      "removal of defects",
      "section 39",
    ],
    sourceUrl: OFFICIAL_ACT_URL,
  },
  {
    id: "appeal-district-commission",
    section: "Section 41",
    title: "Appeal against order of District Commission",
    summary:
      "A person aggrieved by a District Commission order may appeal to the State Commission on facts or law within forty-five days, subject to the Act's conditions for delay and pre-deposit.",
    excerpt:
      "An appeal from an order of the District Commission may be made to the State Commission on facts or law within forty-five days. A delayed appeal may be entertained for sufficient cause. A person required to pay an amount under the order must deposit fifty per cent of that amount before the appeal is entertained, as prescribed.",
    keywords: [
      "appeal district commission order",
      "appeal to state commission",
      "forty five days appeal",
      "consumer forum appeal",
      "appeal deposit",
      "section 41",
    ],
    sourceUrl: OFFICIAL_ACT_URL,
  },
  {
    id: "complaint-limitation",
    section: "Section 69",
    title: "Limitation period",
    summary:
      "A consumer complaint is ordinarily to be filed within two years from the date the cause of action arose. A Commission may admit a delayed complaint if sufficient cause is shown and reasons are recorded.",
    excerpt:
      "The District, State or National Commission shall not admit a complaint unless it is filed within two years from the date on which the cause of action arose. A delayed complaint may be entertained if the complainant shows sufficient cause, provided the Commission records reasons for condoning the delay.",
    keywords: [
      "complaint time limit",
      "limitation period consumer complaint",
      "two years complaint",
      "complaint after two years",
      "late consumer complaint",
      "condonation of delay",
      "section 69",
    ],
    sourceUrl: OFFICIAL_ACT_URL,
  },
  {
    id: "ecommerce-scope",
    section: "Rule 2",
    sourceName: E_COMMERCE_RULES_NAME,
    title: "Scope and applicability of the E-Commerce Rules",
    summary:
      "The E-Commerce Rules apply to goods and services bought or sold over digital or electronic networks, including marketplace and inventory models, and may also apply to an entity outside India that systematically offers goods or services to consumers in India.",
    excerpt:
      "The Rules apply to goods and services bought or sold over digital or electronic networks, all marketplace and inventory models of e-commerce, e-commerce retail, and unfair trade practices across e-commerce models. They also apply to an e-commerce entity not established in India that systematically offers goods or services to consumers in India.",
    keywords: [
      "e commerce rules apply",
      "ecommerce rules apply",
      "foreign website selling in india",
      "online goods services rules",
      "marketplace inventory model",
      "rule 2",
    ],
    sourceUrl: E_COMMERCE_RULES_URL,
  },
  {
    id: "ecommerce-platform-information",
    section: "Rule 4(2)",
    sourceName: E_COMMERCE_RULES_NAME,
    title: "Platform identity and contact information",
    summary:
      "An e-commerce entity must prominently display its legal name, principal address, website details, and customer-care and grievance-officer contact information in a clear and accessible manner.",
    excerpt:
      "Every e-commerce entity must provide prominently on its platform its legal name; principal geographic address of headquarters and branches; website details; and customer-care and grievance-officer contact details, including e-mail address and telephone numbers.",
    keywords: [
      "ecommerce platform contact information",
      "online platform legal name address",
      "customer care grievance officer contact",
      "website must display address",
      "rule 4(2)",
    ],
    sourceUrl: E_COMMERCE_RULES_URL,
  },
  {
    id: "ecommerce-platform-grievance",
    section: "Rule 4(4)",
    sourceName: E_COMMERCE_RULES_NAME,
    title: "Platform grievance redressal mechanism",
    summary:
      "An e-commerce entity must establish an adequate consumer grievance-redressal mechanism, appoint a grievance officer, and display that officer's name, contact details, and designation on its platform.",
    excerpt:
      "Every e-commerce entity must establish an adequate grievance-redressal mechanism, having regard to grievances ordinarily received from India, appoint a grievance officer for consumer grievance redressal, and display the officer's name, contact details and designation on its platform.",
    keywords: [
      "ecommerce grievance officer",
      "online platform grievance mechanism",
      "complain to ecommerce platform",
      "grievance officer contact details",
      "rule 4(4)",
    ],
    sourceUrl: E_COMMERCE_RULES_URL,
  },
  {
    id: "marketplace-disclosures",
    section: "Rule 5",
    sourceName: E_COMMERCE_RULES_NAME,
    title: "Marketplace disclosures and seller transparency",
    summary:
      "A marketplace platform must require accurate product information and prominently provide seller, complaint-tracking, return, refund, payment, and grievance information, including an explanation of key ranking parameters.",
    excerpt:
      "Marketplace e-commerce entities must require sellers to ensure that product descriptions, images and other content are accurate. They must prominently provide seller details, complaint ticket numbers, return, refund, exchange, delivery, payment and grievance information, relevant seller disclosures, and an explanation of the main ranking parameters for goods or sellers.",
    keywords: [
      "marketplace seller information",
      "online marketplace return refund information",
      "complaint ticket number marketplace",
      "seller rating country of origin",
      "ranking parameters online marketplace",
      "rule 5",
    ],
    sourceUrl: E_COMMERCE_RULES_URL,
  },
  {
    id: "marketplace-seller-fair-practices",
    section: "Rule 6(1)-(2)",
    references: ["Rule 6(1)", "Rule 6(2)"],
    sourceName: E_COMMERCE_RULES_NAME,
    title: "Fair practices by marketplace sellers",
    summary:
      "A seller on a marketplace must not use an unfair trade practice, falsely present itself as a consumer, post false consumer reviews, or misrepresent product or service quality or features.",
    excerpt:
      "A seller offering goods or services through a marketplace must not adopt an unfair trade practice. The seller must not falsely represent itself as a consumer and post reviews, or misrepresent the quality or features of goods or services.",
    keywords: [
      "fake review seller marketplace",
      "seller pretending to be consumer",
      "marketplace seller unfair trade practice",
      "misrepresent product quality online seller",
      "rule 6",
    ],
    sourceUrl: E_COMMERCE_RULES_URL,
  },
  {
    id: "marketplace-seller-returns",
    section: "Rule 6(3)",
    sourceName: E_COMMERCE_RULES_NAME,
    title: "Returns and refunds by marketplace sellers",
    summary:
      "A marketplace seller must not refuse to take back goods, withdraw or discontinue services, or refund paid consideration when goods or services are defective, deficient, spurious, misdescribed, or delivered late, subject to the force-majeure exception for late delivery.",
    excerpt:
      "A marketplace seller must not refuse return, withdrawal or discontinuation of services, or refund of consideration where goods or services are defective, deficient or spurious; do not match advertised or agreed characteristics or features; or are delivered late from the stated schedule. The late-delivery part does not apply where delay was due to force majeure.",
    keywords: [
      "marketplace seller refund defective product",
      "online seller refuses return",
      "late delivery refund ecommerce",
      "spurious product refund",
      "rule 6(3)",
    ],
    sourceUrl: E_COMMERCE_RULES_URL,
  },
  {
    id: "marketplace-seller-grievance",
    section: "Rule 6(4)",
    sourceName: E_COMMERCE_RULES_NAME,
    title: "Grievance officer and response times for marketplace sellers",
    summary:
      "A marketplace seller must appoint a grievance officer, acknowledge a consumer complaint within forty-eight hours, and redress it within one month of receipt.",
    excerpt:
      "A seller offering goods or services through a marketplace must appoint a grievance officer for consumer grievance redressal. The grievance officer must acknowledge receipt of a consumer complaint within forty-eight hours and redress the complaint within one month from receipt.",
    keywords: [
      "seller complaint acknowledged forty eight hours",
      "marketplace seller redress complaint one month",
      "seller grievance officer response time",
      "online seller complaint timeline",
      "rule 6(4)",
    ],
    sourceUrl: E_COMMERCE_RULES_URL,
  },
  {
    id: "marketplace-seller-prepurchase-information",
    section: "Rule 6(5)",
    sourceName: E_COMMERCE_RULES_NAME,
    title: "Pre-purchase information from marketplace sellers",
    summary:
      "A marketplace seller must provide information for display before purchase, including total price and charges, applicable notices, relevant product details, return and refund terms, grievance-officer details, importer details where applicable, delivery information, and warranties or guarantees.",
    excerpt:
      "A marketplace seller must provide information for display on the platform, including contractual disclosures, the total price with compulsory and voluntary charges, applicable notices, relevant goods or service details needed for an informed pre-purchase decision, grievance-officer details, importer details where applicable, return and refund terms, delivery information, and relevant guarantees or warranties.",
    keywords: [
      "seller total price delivery charges ecommerce",
      "online seller pre purchase information",
      "country of origin importer marketplace",
      "return refund warranty details seller",
      "rule 6(5)",
    ],
    sourceUrl: E_COMMERCE_RULES_URL,
  },
  {
    id: "inventory-platform-information",
    section: "Rule 7(1)",
    sourceName: E_COMMERCE_RULES_NAME,
    title: "Information provided by inventory e-commerce entities",
    summary:
      "An inventory e-commerce entity must prominently provide clear information about returns, refunds, exchange, warranty, delivery, payment methods, fees, charge-back options, grievance redressal, total price with charges, and a complaint-tracking ticket number.",
    excerpt:
      "An inventory e-commerce entity must prominently provide accurate, accessible information about returns, refunds, exchange, warranties, delivery, payment methods and security, fees or charges, charge-back options, grievance redressal, total price with compulsory and voluntary charges, and a ticket number for each complaint so a consumer can track it.",
    keywords: [
      "inventory ecommerce total price charges",
      "online retailer complaint ticket number",
      "chargeback options ecommerce",
      "inventory platform return refund information",
      "rule 7(1)",
    ],
    sourceUrl: E_COMMERCE_RULES_URL,
  },
  {
    id: "inventory-platform-returns-and-reviews",
    section: "Rule 7(2)-(5)",
    references: ["Rule 7(2)", "Rule 7(3)", "Rule 7(4)", "Rule 7(5)"],
    sourceName: E_COMMERCE_RULES_NAME,
    title: "Reviews, advertising, returns and authenticity on inventory platforms",
    summary:
      "An inventory platform must not post false consumer reviews or misrepresent product features, must keep advertising consistent with actual characteristics, and must not refuse returns or refunds in the situations specified by the Rules. A platform that vouches for authenticity can bear liability concerning authenticity.",
    excerpt:
      "An inventory e-commerce entity must not falsely represent itself as a consumer or post reviews, and must not misrepresent quality or features. Its advertising must match actual characteristics, access and usage conditions. It must not refuse return, withdrawal or refund for defective, deficient, spurious, misdescribed or late-delivered goods or services, subject to the force-majeure exception for late delivery. A platform that vouches for authenticity may bear appropriate liability in an authenticity action.",
    keywords: [
      "inventory ecommerce fake reviews",
      "online retailer refuses refund defective product",
      "inventory platform authenticity guarantee",
      "online retailer misleading advertisement",
      "rule 7",
    ],
    sourceUrl: E_COMMERCE_RULES_URL,
  },
  {
    id: "advertisement-validity-and-disclaimers",
    section: "Valid advertisements and disclaimers",
    sourceName: MISLEADING_AD_GUIDELINES_NAME,
    title: "Conditions for a non-misleading advertisement",
    summary:
      "A valid advertisement must be truthful and honest, must not exaggerate a product or service's accuracy, scientific validity, usefulness, capability or performance, and must not hide material information.",
    excerpt:
      "An advertisement is non-misleading and valid when it contains a truthful and honest representation and does not mislead consumers by exaggerating the accuracy, scientific validity, practical usefulness, capability or performance of the goods, product or service. It must not hide material information whose omission could make the advertisement deceptive.",
    keywords: [
      "valid advertisement truthful accurate",
      "advertisement scientific validity performance",
      "exaggerated product performance",
      "hide material information advertisement",
    ],
    sourceUrl: MISLEADING_AD_GUIDELINES_URL,
  },
  {
    id: "bait-and-free-claim-advertisements",
    section: "Bait advertisements",
    references: ["Bait advertisement"],
    sourceName: MISLEADING_AD_GUIDELINES_NAME,
    title: "Availability and stock disclosures in bait advertisements",
    summary:
      "A bait advertisement offering goods, products or services at a low price must have a reasonable prospect of availability at that price. If demand is expected to exceed stock, the advertisement must clearly state the stock limitation.",
    excerpt:
      "A bait advertisement must not offer goods, products or services at a low price without a reasonable prospect of selling them at that price. Where an advertiser expects demand to exceed available stock, the advertisement must clearly state that limitation. Availability at the advertised price must be ensured for a reasonable period and in reasonable quantities, having regard to the market and nature of the advertisement.",
    keywords: [
      "bait advertisement offer unavailable",
      "low price no reasonable prospect",
      "advertised stock limitation",
      "demand exceeds stock advertisement",
      "limited stock bait advertisement",
    ],
    sourceUrl: MISLEADING_AD_GUIDELINES_URL,
  },
  {
    id: "advertisement-disclaimers",
    section: "Advertisement disclaimers",
    references: ["Disclaimer"],
    sourceName: MISLEADING_AD_GUIDELINES_NAME,
    title: "Limits on disclaimers in advertisements",
    summary:
      "A disclaimer cannot hide material information, correct a misleading claim, or conceal commercial intent. It should use the claim's language and font and must not be unclear or inconspicuous in placement or presentation.",
    excerpt:
      "A disclaimer must not hide material information whose omission could make an advertisement deceptive, conceal the advertisement's commercial intent, or correct a misleading claim. It should be in the same language as the claim and use the same font. Its placement and presentation should not be unclear or inconspicuous to consumers.",
    keywords: [
      "misleading advertisement disclaimer",
      "disclaimer hide material information",
      "disclaimer correct misleading claim",
      "disclaimer language font prominence legibility",
      "commercial intent advertisement",
    ],
    sourceUrl: MISLEADING_AD_GUIDELINES_URL,
  },
  {
    id: "free-claim-advertisements",
    section: "Free-claim advertisements",
    references: ["Free-claim advertisement", "Free claim advertisement"],
    sourceName: MISLEADING_AD_GUIDELINES_NAME,
    title: "Conditions for describing a product or service as free",
    summary:
      "An advertisement must not describe a product or service as free where the consumer must pay for packing, packaging, handling or administration. An unavoidable, separately stated delivery cost is treated differently.",
    excerpt:
      "A product or service must not be described as free if the consumer has to pay anything other than the unavoidable cost of responding, collecting or paying for delivery. It must not be described as free where the consumer pays for packing, packaging, handling or administration, or where the response, collection or delivery cost is passed on as part of the price of the product or service.",
    keywords: [
      "free claim advertisement hidden cost",
      "free product handling administration fees",
      "free advertisement packing packaging charges",
      "unavoidable delivery charge free claim",
      "free product undisclosed charges",
    ],
    sourceUrl: MISLEADING_AD_GUIDELINES_URL,
  },
  {
    id: "advertisements-targeting-children",
    section: "Advertisements targeting children",
    sourceName: MISLEADING_AD_GUIDELINES_NAME,
    title: "Additional safeguards for advertisements targeting children",
    summary:
      "Advertisements targeting children must not exploit their vulnerability, exaggerate product features to create unrealistic expectations, or make children feel inferior for not buying the advertised product or service. Health or nutritional claims need adequate scientific substantiation.",
    excerpt:
      "Advertisements targeting children must not exploit their vulnerability or lack of experience, exaggerate product or service features in a way that gives children unrealistic expectations, or make children feel inferior to others for not buying the advertised product or service. Health or nutritional claims or benefits require adequate scientific substantiation by a recognised body.",
    keywords: [
      "advertisement targeting children",
      "child unrealistic expectations advertisement",
      "children health nutritional claim",
      "child feel inferior not buying product",
      "advertising to children safeguards",
      "scientific substantiation children ad",
    ],
    sourceUrl: MISLEADING_AD_GUIDELINES_URL,
  },
  {
    id: "surrogate-advertisements",
    section: "Surrogate advertisements",
    sourceName: MISLEADING_AD_GUIDELINES_NAME,
    title: "Prohibition on surrogate advertisements",
    summary:
      "The Guidelines prohibit surrogate advertisements used to indirectly promote goods or services whose direct advertising is prohibited or restricted by law. Mere use of a shared brand or company name is not automatically surrogate advertising when the advertisement is otherwise unobjectionable.",
    excerpt:
      "A surrogate advertisement promotes goods, products or services whose direct advertising is prohibited or restricted by law by portraying it as an advertisement for other goods, products or services. Mere use of a brand name or company name also used for restricted goods, products or services is not by itself a surrogate advertisement if the advertisement is not otherwise objectionable under the Guidelines.",
    keywords: [
      "surrogate advertisement",
      "indirect advertisement prohibited product",
      "disguised promotion restricted product",
      "shared brand name surrogate advertisement",
      "tobacco alcohol surrogate ad",
    ],
    sourceUrl: MISLEADING_AD_GUIDELINES_URL,
  },
  {
    id: "endorser-due-diligence",
    section: "Endorser due diligence",
    sourceName: MISLEADING_AD_GUIDELINES_NAME,
    title: "Due diligence and disclosure by endorsers",
    summary:
      "An endorsement should reflect a genuine and reasonably current opinion based on adequate information or experience, and a material connection between an endorser and advertiser that audiences would not reasonably expect should be fully disclosed.",
    excerpt:
      "The Guidelines require due diligence before an endorsement. An endorsement must reflect the genuine, reasonably current opinion of the endorser, be based on adequate information about or experience with the product or service, and not otherwise be deceptive. A connection that could materially affect credibility and is not reasonably expected by the audience must be fully disclosed.",
    keywords: [
      "endorser due diligence",
      "celebrity endorsement check product",
      "influencer paid partnership disclosure",
      "genuine current opinion endorsement",
      "advertiser endorser connection disclosure",
    ],
    sourceUrl: MISLEADING_AD_GUIDELINES_URL,
  },
  {
    id: "dark-pattern-definition",
    section: "Dark patterns",
    isBroadTopic: true,
    sourceName: DARK_PATTERNS_GUIDELINES_NAME,
    title: "Meaning and prevention of dark patterns",
    summary:
      "Dark patterns are deceptive user-interface or user-experience practices that mislead or trick users into actions they did not intend or want, by impairing consumer autonomy, decision-making, or choice.",
    excerpt:
      "The Guidelines describe dark patterns as deceptive design practices using user-interface or user-experience interactions on a platform to mislead or trick users into doing something they did not intend or want, by subverting or impairing consumer autonomy, decision-making or choice. They identify thirteen specified dark patterns.",
    keywords: [
      "what is a dark pattern",
      "dark pattern meaning",
      "deceptive user interface",
      "trick user online platform",
      "consumer choice manipulation",
    ],
    sourceUrl: DARK_PATTERNS_GUIDELINES_URL,
  },
  {
    id: "dark-pattern-false-urgency",
    section: "False urgency",
    sourceName: DARK_PATTERNS_GUIDELINES_NAME,
    title: "False urgency or scarcity",
    summary:
      "False urgency is a false claim or implication of urgency or scarcity intended to push a user into an immediate purchase or action that may lead to a purchase. Genuine remaining stock or a genuine deadline alone is not false urgency.",
    excerpt:
      "False urgency includes falsely showing popularity or stating that quantities are more limited than they actually are in order to mislead a user into making an immediate purchase or taking an immediate action that may lead to a purchase.",
    keywords: [
      "false urgency",
      "fake limited stock",
      "fake scarcity online sale",
      "only few left false",
      "fake popularity product",
      "fake countdown",
      "fake countdown sale deadline",
      "genuine stock genuine deadline",
    ],
    sourceUrl: DARK_PATTERNS_GUIDELINES_URL,
  },
  {
    id: "dark-pattern-basket-sneaking",
    section: "Basket sneaking",
    sourceName: DARK_PATTERNS_GUIDELINES_NAME,
    title: "Additional items added at checkout without consent",
    summary:
      "Basket sneaking is adding an extra product, service, payment, charity contribution, or donation at checkout without the user's consent, increasing the amount payable beyond the item selected. Clearly disclosed necessary fees and complimentary services are not treated as basket sneaking.",
    excerpt:
      "Basket sneaking includes adding extra items, services, payments to charity or donations at checkout without the user's consent so that the amount payable exceeds the amount for the selected product or service. Free samples, complimentary services and necessary fees disclosed at the time of purchase are not treated as basket sneaking.",
    keywords: [
      "basket sneaking",
      "preselected donation checkout",
      "extra item added cart without consent",
      "automatic travel insurance checkout",
      "paid insurance without consent",
      "necessary fee disclosed at purchase",
      "hidden checkout addition",
    ],
    sourceUrl: DARK_PATTERNS_GUIDELINES_URL,
  },
  {
    id: "dark-pattern-subscription-trap",
    section: "Subscription trap",
    sourceName: DARK_PATTERNS_GUIDELINES_NAME,
    title: "Difficult or hidden subscription cancellation",
    summary:
      "A subscription trap includes making cancellation impossible, complex, lengthy, hidden, or confusing, or requiring payment details or auto-debit authorisation for a free subscription.",
    excerpt:
      "Subscription trap includes making cancellation of a paid subscription impossible or a complex and lengthy process; hiding the cancellation option; forcing payment details or auto-debit authorisation for a free subscription; or giving ambiguous, latent, confusing or cumbersome cancellation instructions.",
    keywords: [
      "subscription trap",
      "cancel subscription difficult",
      "hidden cancellation option",
      "free trial payment details auto debit",
      "subscription cancellation confusing",
    ],
    sourceUrl: DARK_PATTERNS_GUIDELINES_URL,
  },
  {
    id: "dark-pattern-drip-pricing",
    section: "Drip pricing",
    sourceName: DARK_PATTERNS_GUIDELINES_NAME,
    title: "Hidden or delayed price elements",
    summary:
      "Drip pricing is not revealing price elements upfront, revealing them later in the user journey, charging more than the checkout price, or presenting something as free without disclosing a later in-app cost or condition. A marketplace is not automatically liable for price changes attributable to third-party sellers or factors beyond its control.",
    excerpt:
      "Drip pricing includes not revealing price elements upfront or revealing them surreptitiously during the user experience; charging an amount higher than that disclosed at checkout; advertising a service as free without appropriate disclosure that continued use requires an in-app purchase; or preventing use of an already paid service unless something additional is bought. A marketplace e-commerce entity is not liable for price fluctuations attributable to third-party sellers or other factors beyond its control.",
    keywords: [
      "drip pricing",
      "hidden charges checkout",
      "price increased after checkout",
      "free app later payment",
      "undisclosed fees online",
      "mandatory fee at payment",
      "third party seller price fluctuation",
    ],
    sourceUrl: DARK_PATTERNS_GUIDELINES_URL,
  },
  {
    id: "dark-pattern-bait-switch-and-disguised-ads",
    section: "Bait and switch and disguised advertisements",
    references: ["Bait and switch", "Disguised advertisement"],
    sourceName: DARK_PATTERNS_GUIDELINES_NAME,
    title: "Switching offers and masking advertisements",
    summary:
      "Bait and switch means advertising one outcome while deceptively serving another, and a disguised advertisement masks promotional content as other material to trick users into clicking or acting on it.",
    excerpt:
      "The Guidelines identify bait and switch, such as offering a product at one price but steering a user to a different or more expensive outcome, and disguised advertisements that pose as user-generated content, news articles, or other interface content to trick users into clicking them.",
    keywords: [
      "bait and switch",
      "advertised product unavailable expensive alternative",
      "disguised advertisement",
      "ad looks like news article",
      "sponsored content disguised",
    ],
    sourceUrl: DARK_PATTERNS_GUIDELINES_URL,
  },
];
