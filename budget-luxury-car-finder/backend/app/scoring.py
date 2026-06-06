import json
import re
from pathlib import Path
from typing import Any


DATA_DIR = Path(__file__).resolve().parent / "data"

HIGH_RISK_KEYWORDS = [
    "corrosion",
    "subframe",
    "gearbox",
    "transmission",
    "oil leak",
    "coolant leak",
    "engine management",
    "emissions",
    "suspension arm",
    "shock absorber",
    "brake pipe corroded",
    "structural",
]

MEDIUM_RISK_KEYWORDS = [
    "tyre worn",
    "brake pads",
    "brake discs",
    "ball joint",
    "bush worn",
    "minor leak",
    "exhaust",
]


def load_json_file(filename: str) -> list[dict[str, Any]]:
    path = DATA_DIR / filename
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def get_recommended_models() -> list[dict[str, Any]]:
    return load_json_file("recommended_models.json")


def get_avoid_models() -> list[dict[str, Any]]:
    return load_json_file("avoid_models.json")


def normalise(value: Any) -> str:
    return str(value or "").lower().strip()


def combined_text(car: Any) -> str:
    parts = [
        getattr(car, "title", ""),
        getattr(car, "make", ""),
        getattr(car, "model", ""),
        getattr(car, "engine", ""),
        getattr(car, "gearbox", ""),
        getattr(car, "fuel_type", ""),
        getattr(car, "trim", ""),
    ]
    return normalise(" ".join(str(part or "") for part in parts))


def contains_wordish(haystack: str, needle: str) -> bool:
    escaped = re.escape(needle.lower())
    return re.search(rf"(^|\W){escaped}($|\W)", haystack.lower()) is not None


def add_adjustment(
    breakdown: list[dict[str, Any]],
    category: str,
    points: int,
    label: str,
) -> int:
    breakdown.append(
        {
            "category": category,
            "points": points,
            "label": label,
            "kind": "bonus" if points >= 0 else "penalty",
        }
    )
    return points


def score_to_verdict(score: int) -> tuple[str, str]:
    if score >= 85:
        return "Excellent", "excellent"
    if score >= 70:
        return "Strong buy", "strong"
    if score >= 55:
        return "Maybe", "maybe"
    if score >= 40:
        return "Risky", "risky"
    return "Avoid", "avoid"


def score_mot_notes(notes: str | None) -> tuple[int, list[dict[str, Any]], list[str]]:
    text = normalise(notes)
    breakdown: list[dict[str, Any]] = []
    warnings: list[str] = []
    if not text:
        return 0, breakdown, warnings

    high_hits = []
    medium_hits = []
    for keyword in HIGH_RISK_KEYWORDS:
        count = text.count(keyword)
        if count:
            high_hits.append((keyword, count))
    for keyword in MEDIUM_RISK_KEYWORDS:
        count = text.count(keyword)
        if count:
            medium_hits.append((keyword, count))

    total_penalty = 0
    high_count = sum(count for _, count in high_hits)
    medium_count = sum(count for _, count in medium_hits)

    if high_count:
        penalty = -30 if high_count >= 3 else -22 if high_count == 2 else -15
        total_penalty += add_adjustment(
            breakdown,
            "MOT",
            penalty,
            f"MOT mentions high-risk items: {', '.join(keyword for keyword, _ in high_hits)}",
        )
        warnings.append("MOT history contains high-risk wording.")

    if medium_count:
        penalty = -10 if medium_count >= 3 else -7 if medium_count == 2 else -3
        total_penalty += add_adjustment(
            breakdown,
            "MOT",
            penalty,
            f"MOT mentions maintenance items: {', '.join(keyword for keyword, _ in medium_hits)}",
        )
        warnings.append("MOT history contains medium-risk maintenance wording.")

    return total_penalty, breakdown, warnings


def recommendation_matches(car: Any, recommendation: dict[str, Any]) -> bool:
    text = combined_text(car)
    make = normalise(recommendation.get("make"))
    model = normalise(recommendation.get("model"))
    year = getattr(car, "year", None)
    year_start, year_end = recommendation.get("years", [None, None])

    make_match = make and contains_wordish(text, make)
    model_match = model and model in text
    year_match = year is None or year_start is None or year_start <= year <= year_end

    return bool(make_match and model_match and year_match)


def engine_or_gearbox_aligns(car: Any, recommendation: dict[str, Any]) -> bool:
    text = combined_text(car)
    expected = normalise(recommendation.get("engine"))
    if not expected:
        return False

    tokens = [
        token
        for token in re.split(r"[\s/\-]+", expected)
        if len(token) >= 3 or re.match(r"\d\.\d", token)
    ]
    if not tokens:
        return False
    matched = sum(1 for token in tokens if token in text)
    return matched >= max(1, min(2, len(tokens)))


def avoid_rule_matches(car: Any, rule: dict[str, Any]) -> bool:
    text = combined_text(car)
    make = normalise(rule.get("make"))
    models = [normalise(model) for model in rule.get("models", [])]
    keywords = [normalise(keyword) for keyword in rule.get("matchKeywords", [])]

    make_match = not make or contains_wordish(text, make)
    model_match = any(model and model in text for model in models)
    keyword_match = all(keyword in text for keyword in keywords)

    return bool(make_match and model_match and keyword_match)


def score_car(car: Any) -> dict[str, Any]:
    score = 50
    breakdown: list[dict[str, Any]] = [
        {
            "category": "Base",
            "points": 50,
            "label": "Starting score",
            "kind": "bonus",
        }
    ]
    warnings: list[str] = []
    hard_flags: list[str] = []
    matched_recommendations: list[dict[str, Any]] = []
    matched_avoid_rules: list[dict[str, Any]] = []
    comfort_estimate = None
    reliability_estimate = None

    price = getattr(car, "price", None)
    if price is not None:
        if price <= 5000:
            score += add_adjustment(breakdown, "Price", 10, "At or below GBP 5,000")
        elif price <= 6000:
            score += add_adjustment(breakdown, "Price", 5, "Within GBP 6,000 budget")
        else:
            score += add_adjustment(breakdown, "Price", -40, "Over GBP 6,000 budget")
            hard_flags.append("Over budget")
            warnings.append("This listing is over the GBP 6,000 maximum budget.")

    gearbox = normalise(getattr(car, "gearbox", None))
    if "auto" in gearbox or "dsg" in gearbox or "cvt" in gearbox or "e-cvt" in gearbox or "geartronic" in gearbox:
        score += add_adjustment(breakdown, "Gearbox", 10, "Automatic gearbox")
    elif "manual" in gearbox:
        score += add_adjustment(breakdown, "Gearbox", -50, "Manual gearbox")
        hard_flags.append("Avoid")
        warnings.append("Manual gearbox conflicts with the automatic-only requirement.")
    else:
        score += add_adjustment(breakdown, "Gearbox", -10, "Unknown gearbox")
        warnings.append("Gearbox is unknown. Confirm it is automatic before shortlisting.")

    road_tax = getattr(car, "road_tax", None)
    if road_tax is None:
        score += add_adjustment(breakdown, "Road tax", -5, "Road tax unknown")
        warnings.append("Road tax is unknown. Check the exact annual VED before buying.")
    elif road_tax <= 35:
        score += add_adjustment(breakdown, "Road tax", 10, "Very low road tax")
    elif road_tax <= 150:
        score += add_adjustment(breakdown, "Road tax", 8, "Low road tax")
    elif road_tax <= 250:
        score += add_adjustment(breakdown, "Road tax", 3, "Road tax under GBP 250")
    else:
        score += add_adjustment(breakdown, "Road tax", -30, "Road tax over GBP 250")
        hard_flags.append("Tax too high")
        warnings.append("Road tax is above the GBP 250 annual limit.")

    mileage = getattr(car, "mileage", None)
    if mileage is None:
        score += add_adjustment(breakdown, "Mileage", -5, "Mileage unknown")
        warnings.append("Mileage is unknown.")
    elif mileage < 60000:
        score += add_adjustment(breakdown, "Mileage", 5, "Low mileage")
        warnings.append("Low mileage is not automatically better if the car mostly did short trips.")
    elif mileage <= 115000:
        score += add_adjustment(breakdown, "Mileage", 12, "Ideal mileage range")
    elif mileage <= 130000:
        score += add_adjustment(breakdown, "Mileage", 4, "Acceptable mileage with strong history")
        warnings.append("Mileage is acceptable only if service history is convincing.")
    elif mileage <= 140000:
        score += add_adjustment(breakdown, "Mileage", -8, "Upper mileage risk band")
        warnings.append("Mileage is high. Service history and condition matter more here.")
    else:
        score += add_adjustment(breakdown, "Mileage", -25, "Over 140,000 miles")
        hard_flags.append("High mileage risk")
        warnings.append("Mileage is over 140,000, which is high risk for a 5-year ownership plan.")

    service_history = normalise(getattr(car, "service_history", None))
    if service_history == "full":
        score += add_adjustment(breakdown, "Service history", 15, "Full service history")
    elif service_history == "partial":
        score += add_adjustment(breakdown, "Service history", 3, "Partial service history")
        warnings.append("Partial service history leaves some ownership risk.")
    elif service_history == "none":
        score += add_adjustment(breakdown, "Service history", -25, "No service history")
        warnings.append("No service history is a major risk for an older luxury car.")
    else:
        score += add_adjustment(breakdown, "Service history", -10, "Unknown service history")
        warnings.append("Service history is unknown.")

    insurance_group = getattr(car, "insurance_group", None)
    if insurance_group is None:
        score += add_adjustment(breakdown, "Insurance", -3, "Insurance group unknown")
        warnings.append("Insurance group is unknown. Get quotes before viewing.")
    elif insurance_group <= 18:
        score += add_adjustment(breakdown, "Insurance", 12, "Low insurance group")
    elif insurance_group <= 25:
        score += add_adjustment(breakdown, "Insurance", 6, "Moderate insurance group")
    elif insurance_group <= 32:
        score += add_adjustment(breakdown, "Insurance", -4, "Higher insurance group")
        warnings.append("Insurance may be uncomfortable for a 22-year-old driver.")
    elif insurance_group <= 40:
        score += add_adjustment(breakdown, "Insurance", -12, "High insurance group")
        warnings.append("Insurance is likely a serious cost risk.")
    else:
        score += add_adjustment(breakdown, "Insurance", -25, "Very high insurance group")
        warnings.append("Insurance group is likely too high for this brief.")

    mot_score, mot_breakdown, mot_warnings = score_mot_notes(getattr(car, "mot_notes", None))
    score += mot_score
    breakdown.extend(mot_breakdown)
    warnings.extend(mot_warnings)

    comfort_manual = getattr(car, "comfort_score_manual", None)
    if comfort_manual is not None:
        comfort_estimate = comfort_manual
        if comfort_manual >= 8:
            score += add_adjustment(breakdown, "Comfort", 6, "Strong manual comfort score")
        elif comfort_manual >= 6:
            score += add_adjustment(breakdown, "Comfort", 2, "Acceptable manual comfort score")
        elif comfort_manual <= 4:
            score += add_adjustment(breakdown, "Comfort", -4, "Low manual comfort score")
            warnings.append("Comfort score is below the target for this brief.")

    reliability_manual = getattr(car, "reliability_score_manual", None)
    if reliability_manual is not None:
        reliability_estimate = reliability_manual
        if reliability_manual >= 8:
            score += add_adjustment(breakdown, "Reliability", 6, "Strong manual reliability score")
        elif reliability_manual >= 6:
            score += add_adjustment(breakdown, "Reliability", 2, "Acceptable manual reliability score")
        elif reliability_manual <= 4:
            score += add_adjustment(breakdown, "Reliability", -8, "Low manual reliability score")
            warnings.append("Reliability score is below the target for a 5-year ownership plan.")

    gearbox_risk = normalise(getattr(car, "gearbox_risk_manual", None))
    if gearbox_risk == "low":
        score += add_adjustment(breakdown, "Gearbox risk", 4, "Low gearbox risk")
    elif gearbox_risk == "medium":
        score += add_adjustment(breakdown, "Gearbox risk", -4, "Medium gearbox risk")
        warnings.append("Gearbox risk is medium. Look for servicing proof.")
    elif gearbox_risk == "high":
        score += add_adjustment(breakdown, "Gearbox risk", -12, "High gearbox risk")
        warnings.append("Gearbox risk is high and could become expensive.")

    for recommendation in get_recommended_models():
        if recommendation_matches(car, recommendation):
            matched_recommendations.append(recommendation)
            comfort_estimate = comfort_estimate or recommendation.get("comfortScore")
            reliability_estimate = reliability_estimate or recommendation.get("reliabilityScore")
            score += add_adjustment(
                breakdown,
                "Model intelligence",
                8,
                f"Matches recommended model: {recommendation['make']} {recommendation['model']}",
            )
            if engine_or_gearbox_aligns(car, recommendation):
                score += add_adjustment(
                    breakdown,
                    "Model intelligence",
                    4,
                    f"Engine or gearbox aligns with recommended setup: {recommendation['engine']}",
                )
            if normalise(recommendation.get("insuranceRisk")) == "high":
                score += add_adjustment(
                    breakdown,
                    "Model intelligence",
                    -5,
                    "Recommended model but insurance risk is high",
                )
                warnings.append("This model is recommended, but insurance may be high for a 22-year-old.")

    for rule in get_avoid_models():
        if avoid_rule_matches(car, rule):
            matched_avoid_rules.append(rule)
            penalty = int(rule.get("penalty", -15))
            score += add_adjustment(
                breakdown,
                "Avoid intelligence",
                penalty,
                f"Matches avoid warning: {rule['name']}",
            )
            warnings.extend(rule.get("reason", []))

    final_score = max(0, min(100, round(score)))
    verdict, verdict_class = score_to_verdict(final_score)
    main_risks = list(dict.fromkeys(warnings[:6]))

    return {
        "score": final_score,
        "verdict": verdict,
        "verdict_class": verdict_class,
        "score_breakdown": breakdown,
        "warnings": list(dict.fromkeys(warnings)),
        "hard_flags": list(dict.fromkeys(hard_flags)),
        "matched_recommendations": matched_recommendations,
        "matched_avoid_rules": matched_avoid_rules,
        "comfort_estimate": comfort_estimate,
        "reliability_estimate": reliability_estimate,
        "main_risks": main_risks,
    }
