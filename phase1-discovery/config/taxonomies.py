"""Shared taxonomies from architecture appendix."""

BARRIER_TAXONOMY: dict[str, dict[str, str]] = {
    "B1_habit": {
        "label": "Habit / Reorder lock-in",
        "tag": "barrier:habit",
        "keywords": [
            "reorder", "same order", "every week", "routine", "habit",
            "repeat", "autopilot", "same cart", "weekly",
        ],
    },
    "B2_trust": {
        "label": "Trust / Quality uncertainty",
        "tag": "barrier:trust",
        "keywords": [
            "trust", "quality", "genuine", "fake", "authentic", "unsure",
            "don't know if", "counterfeit", "expiry",
        ],
    },
    "B3_discovery": {
        "label": "Discovery friction",
        "tag": "barrier:discovery",
        "keywords": [
            "can't find", "didn't know", "hard to find", "browse",
            "discover", "hidden", "not visible", "search",
        ],
    },
    "B4_price": {
        "label": "Price sensitivity",
        "tag": "barrier:price",
        "keywords": [
            "expensive", "overpriced", "cheaper", "price", "cost",
            "amazon is cheaper", "not worth",
        ],
    },
    "B5_cognitive": {
        "label": "Cognitive overload",
        "tag": "barrier:cognitive",
        "keywords": [
            "too many choices", "overwhelming", "confusing", "decision",
            "mental load", "fatigue", "so many options",
        ],
    },
    "B6_delivery": {
        "label": "Delivery / Freshness concern",
        "tag": "barrier:delivery",
        "keywords": [
            "fresh", "damaged", "late delivery", "return", "refund",
            "packaging", "melted", "stale",
        ],
    },
    "B7_social": {
        "label": "Need for social proof",
        "tag": "barrier:social",
        "keywords": [
            "reviews", "ratings", "recommendation", "popular",
            "what others buy", "social proof", "stars",
        ],
    },
}

SEGMENT_TAXONOMY: dict[str, dict[str, str]] = {
    "habitual_grocery_repeater": {
        "label": "Habitual Grocery Repeater",
        "keywords": ["grocery", "groceries", "milk", "vegetables", "staples", "weekly order"],
    },
    "single_category_snack": {
        "label": "Single-Category Snack Buyer",
        "keywords": ["snacks", "chips", "beverages", "cold drink", "maggi"],
    },
    "household_expander": {
        "label": "Household Expander",
        "keywords": ["household", "cleaning", "detergent", "essentials"],
    },
    "explorer": {
        "label": "Category Explorer",
        "keywords": ["try new", "explore", "different categories", "variety"],
    },
    "pet_owner": {
        "label": "Pet Owner",
        "keywords": ["pet", "dog food", "cat food", "pedigree"],
    },
    "parent": {
        "label": "Parent",
        "keywords": ["baby", "diaper", "infant", "child", "kids"],
    },
}

DISCOVERY_PATH_KEYWORDS: dict[str, list[str]] = {
    "reorder_button": ["reorder", "order again", "repeat order"],
    "search": ["search", "typed", "looked for"],
    "homepage_browse": ["homepage", "banner", "scroll", "browse"],
    "recommendation": ["suggested", "recommended", "you may like"],
    "external": ["amazon", "flipkart", "local store", "kirana", "offline"],
    "word_of_mouth": ["friend", "family", "colleague", "recommended by"],
}

RESEARCH_QUESTIONS: dict[str, str] = {
    "Q1": "Why do users repeatedly buy from the same categories?",
    "Q2": "What prevents users from exploring new categories?",
    "Q3": "How do users discover products today?",
    "Q4": "What role do habits play in shopping behavior?",
    "Q5": "What information do users need before trying a new category?",
    "Q6": "What frustrations emerge repeatedly?",
    "Q7": "Which user segments are more likely to experiment?",
    "Q8": "What unmet needs emerge consistently?",
}

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "groceries": ["grocery", "groceries", "vegetables", "milk", "staples"],
    "snacks_beverages": ["snacks", "chips", "beverages", "drinks"],
    "household_essentials": ["household", "cleaning", "detergent"],
    "personal_care": ["personal care", "shampoo", "soap", "skincare"],
    "pet_supplies": ["pet", "dog food", "cat food"],
    "baby_products": ["baby", "diaper", "infant"],
}

COMPETITOR_KEYWORDS = ["zepto", "blinkit", "bigbasket", "amazon", "flipkart", "dunzo"]

APP_NAMES = ["swiggy", "instamart", "zepto", "blinkit", "bigbasket"]

SOURCE_TYPES = [
    "app_store",
    "play_store",
    "reddit",
    "forum",
    "social",
    "product_review",
    "qc_discussion",
]
