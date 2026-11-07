"""Focused explanations for common follow-ups, gated by selected source wording."""

import re


LATE = re.compile(r"\b(?:late|delayed|delay)\b", re.I)
LATE_DELIVERY = re.compile(
    r"\b(?:(?:arriv\w*|deliver\w*|order|item|parcel)\b[^?;]{0,30}\b(?:late|delayed)|"
    r"(?:late|delayed) delivery|missed the (?:delivery|promised) date|force majeure)\b", re.I,
)
REFUND_DELAY = re.compile(
    r"\brefund(?: payment)?\s+(?:(?:was|is|has been|came|arrived|comes|arrives)\s+)?(?:late|delayed)\b", re.I,
)
TIMING = re.compile(r"\b(?:how long|how soon|when|deadline|time limit|how many days)\b", re.I)
ACKNOWLEDGE = re.compile(r"\b(?:acknowledg\w*|confirm\w*|receipt)\b", re.I)
RESOLVE = re.compile(r"\b(?:resolv\w*|redress\w*|fix\w*)\b", re.I)
RETURNS = {
    "marketplace-seller-returns": "the marketplace seller",
    "inventory-platform-returns-and-reviews": "the online retailer",
}
GRIEVANCE = {
    "marketplace-seller-grievance": "The marketplace seller's grievance officer",
    "ecommerce-platform-response-time": "The platform's grievance officer",
}


def focused_summary(question, record_id, quotes):
    """Return a narrower explanation only when the selected quote supports it."""
    evidence = " ".join(" ".join(quote.casefold().split()) for quote in quotes)
    if (record_id in RETURNS and LATE_DELIVERY.search(question) and not REFUND_DELAY.search(question)
            and all(term in evidence for term in ("refund consideration", "stated delivery schedule", "force majeure"))):
        return (f"If the order arrived after the stated delivery date, {RETURNS[record_id]} must not refuse "
                "your request for a return or refund. This rule does not apply if force majeure caused the delay.")
    if (record_id in GRIEVANCE and TIMING.search(question)
            and "within forty-eight hours" in evidence and "within one month" in evidence):
        officer = GRIEVANCE[record_id]
        acknowledge, resolve = ACKNOWLEDGE.search(question), RESOLVE.search(question)
        if acknowledge and not resolve:
            return f"{officer} must acknowledge the complaint within 48 hours of receiving it."
        if resolve and not acknowledge:
            return f"{officer} must resolve the complaint within one month of receiving it."
        return (f"{officer} must acknowledge the complaint within 48 hours and resolve it within one month "
                "of receiving it.")
    if (record_id == "ecommerce-accepted-refunds" and (TIMING.search(question) or REFUND_DELAY.search(question))
            and all(term in evidence for term in ("accepted refund requests", "reasonable period", "applicable laws"))):
        return ("Once the refund is accepted, the platform must pay it within a reasonable period or the period "
                "required by applicable law. This rule does not set a fixed number of days.")
    if (record_id == "appeal-district-commission" and TIMING.search(question)
            and all(term in evidence for term in ("forty-five days", "date of the order", "sufficient cause"))):
        return ("The usual deadline is 45 days from the date of the District Commission's order. "
                "The State Commission may accept a late appeal if there was sufficient cause for the delay.")
    if (record_id == "complaint-limitation" and (TIMING.search(question) or LATE.search(question))
            and all(term in evidence for term in ("within two years", "cause of action", "sufficient cause", "records its reasons"))):
        return ("The usual deadline is two years from when the cause of action arose. A Commission may admit a "
                "late complaint if you show sufficient cause and it records its reasons for allowing the delay.")
    return None
