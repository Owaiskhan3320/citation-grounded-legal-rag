"""Built-in replies and bounded context for the Streamlit chat."""

from dataclasses import dataclass
import re


MAX_TURNS = 6
MAX_CONTEXT_CHARS = 360
CLARIFY = "What consumer issue are you referring to? Mention the seller, purchase, or complaint so I can look up the right source."
GREETING = re.compile(r"(?:hi|hello|hey|good morning|good afternoon|good evening)(?: there)?\b")
HELP = (
    (r"(?:who are you|what are you|what can you (?:answer|do|help with)|what (?:questions|topics) can you answer)",
     "I can look up Indian consumer-law questions about returns, refunds, misleading ads, hidden fees, and consumer complaints. I can explain the rules and link to official sources, but I can't predict case outcomes or file a complaint for you."),
    (r"(?:how (?:can|do|should) (?:i|we) use (?:you|this|this guide|this app)|how (?:does (?:this|this guide|this app)|do you) work|(?:help|help me|get started))",
     "Describe what happened and ask what you'd like to know. For example: 'An online marketplace seller sent the wrong item. Can I return it?' You can ask a short follow-up in this chat, and open the source link to read the official wording."),
    (r"(?:what (?:data|sources|documents) (?:are|were) you trained on|what (?:data|sources|documents) do you use|what are your (?:sources|data sources)|what were you trained on)",
     "I look up a curated collection of official Indian consumer-law sources, including the Consumer Protection Act, E-Commerce Rules, advertising and dark-pattern guidelines, and official complaint guidance. These are reference documents, not the training data of the underlying model. See Sources and coverage for the list."),
)
FOLLOW_UP = re.compile(
    r"^(?:and\s+)?(?:what (?:if|about) (?:it|they|he|she|that|this|these|those)\b|"
    r"(?:(?:how(?: long| soon)?|when|where|why|what)\s+)?"
    r"(?:can|could|do|does|did|should|would|will|is|are|must)\s+"
    r"(?:(?:they|it|he|she|that|this)\b|(?:i|we)\s+"
    r"(?:still\b|(?:return|cancel|report|file|track|appeal|claim|challenge|escalate|replace|repair|do)"
    r"(?:\s+\w+){0,2}\s+(?:it|them|that|this)\b))|"
    r"what (?:now|happens next|should i do next)\b)", re.I,
)
CONCRETE_CONDITION = re.compile(r"\bif\s+(?:an?|the|my)\s+(?:\w+\s+){0,2}(?:seller|platform|commission|merchant)\b", re.I)
VAGUE = re.compile(r"(?:and\s+)?(?:what about (?:it|that|this)|what do you mean|can you explain that)", re.I)
SHORT_FOLLOW_UP = re.compile(
    r"(?:how long do (?:i|we|they) have|(?:what is|what's) the (?:deadline|time limit)|"
    r"what if (?:the |my )?(?:order|item|delivery|refund) (?:was|is|comes|arrives|arrived) "
    r"(?:late|delayed|damaged|wrong)(?: instead)?)", re.I,
)


@dataclass(frozen=True)
class ChatContext:
    question: str
    topics: tuple[str, ...]
    latest_follow_up: str = ""

    def search_context(self):
        # Keep the most recent detail ahead of the original scenario. Neither leaves the app.
        return "\n".join(filter(None, (self.latest_follow_up, self.question)))


def quick_reply(message):
    text = " ".join(re.findall(r"[a-z0-9]+", message.casefold()))
    greeting = GREETING.match(text)
    if greeting:
        text = text[greeting.end():].strip()
        if not text:
            return "Hello! Ask me about Indian consumer rights. For example: 'Where can I file a consumer complaint online?'"
    for pattern, reply in HELP:
        if re.fullmatch(pattern, text):
            return reply
    return None


def needs_context(question):
    text = question.strip().rstrip("?!. ")
    return (len(text) <= 160 and "?" not in text and ";" not in text
            and bool(FOLLOW_UP.match(text) or SHORT_FOLLOW_UP.fullmatch(text))
            and not CONCRETE_CONDITION.search(text))


def context_after_answer(question, result, previous=None):
    if result["mode"] != "grounded_quotes" or len(result["parts"]) != 1:
        return None
    titles = tuple(dict.fromkeys(result["sources"][quote["source"]]["title"] for quote in result["quotes"]))
    if previous:
        return ChatContext(previous.question, titles, question[:160])
    return ChatContext(question[:MAX_CONTEXT_CHARS], titles)
