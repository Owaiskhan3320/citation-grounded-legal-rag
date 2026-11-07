import unittest

from python_rag.follow_up import focused_summary
from python_rag.retrieval import corpus_snapshot


class FollowUpSummaryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.records, _ = corpus_snapshot()

    def summary(self, record_id, question):
        record = next(record for record in self.records if record["id"] == record_id)
        return focused_summary(question, record_id, [p["text"] for p in record["passages"]])

    def test_late_delivery_does_not_apply_to_a_delayed_refund(self):
        self.assertIsNone(self.summary("marketplace-seller-returns", "What if the refund arrived late?"))

    def test_short_excerpt_cannot_support_the_late_delivery_exception(self):
        self.assertIsNone(focused_summary("What if it arrived late?", "marketplace-seller-returns",
                                         ["delivered late from the stated delivery schedule"]))

    def test_complaint_acknowledgement_and_resolution_are_distinct(self):
        record = "marketplace-seller-grievance"
        self.assertIn("48 hours", self.summary(record, "When must they acknowledge it?"))
        resolution = self.summary(record, "How long do they have to resolve it?")
        self.assertIn("one month", resolution)
        self.assertNotIn("48 hours", resolution)

    def test_refund_timing_does_not_invent_a_fixed_deadline(self):
        summary = self.summary("ecommerce-accepted-refunds", "How long do they have?")
        self.assertIn("reasonable period", summary)
        self.assertIn("does not set a fixed number of days", summary)

    def test_appeal_deadline_includes_the_delay_exception(self):
        summary = self.summary("appeal-district-commission", "How long do I have?")
        self.assertIn("45 days from the date", summary)
        self.assertIn("sufficient cause", summary)
