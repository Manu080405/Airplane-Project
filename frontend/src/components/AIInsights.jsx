import {
  FaBrain,
  FaUserGroup,
  FaBullhorn,
  FaSackDollar,
  FaTriangleExclamation,
  FaCircleInfo,
  FaListCheck,
  FaFileLines,
  FaGaugeHigh,
  FaClipboardList,
  FaRoute,
} from "react-icons/fa6";

/* ============================================================================
   SECTION 1 — SIGNAL EXTRACTION
   The ML model's output (prediction + probability) is the ONLY source of
   truth. Everything below reads these two values and interprets them —
   nothing here ever changes or re-derives the prediction itself.
============================================================================ */

function resolvePurchased(prediction) {
  return (
    prediction.prediction === "Ticket Purchased" ||
    prediction.prediction === 1 ||
    prediction.prediction === true
  );
}

function resolveProbability(prediction) {
  return prediction.probability ?? prediction.confidence ?? prediction.score ?? 0;
}

function resolveTier(probability) {
  if (probability >= 80) return "high";
  if (probability >= 50) return "medium";
  return "low";
}

/** Distance from the 50% decision boundary, normalized to 0-100.
 *  A deterministic transform of `probability` only — no invented signal. */
function computeCertaintyScore(probability) {
  const distanceFromBoundary = Math.abs(probability - 50);
  return Math.round(Math.min(distanceFromBoundary / 50, 1) * 100);
}

function certaintyLabel(score) {
  if (score >= 80) return "very strong signal separation";
  if (score >= 60) return "strong signal separation";
  if (score >= 35) return "moderate signal separation";
  if (score >= 15) return "weak signal separation";
  return "near the decision boundary";
}

/** Flags cases sitting close to a tier threshold (50 or 80) so the
 *  narrative can reflect that the classification, while valid, is
 *  less "settled" than a value in the middle of its tier. */
function resolveBoundaryProximity(probability, tier) {
  const NEAR = 5;

  if (tier === "high") {
    const d = probability - 80;
    return d <= NEAR
      ? { isBorderline: true, distance: d, thresholdLabel: "the high-confidence threshold (80%)" }
      : { isBorderline: false, distance: d, thresholdLabel: null };
  }

  if (tier === "medium") {
    const dCeil = 80 - probability;
    const dFloor = probability - 50;
    if (dCeil <= NEAR) {
      return { isBorderline: true, distance: dCeil, thresholdLabel: "the high-confidence threshold (80%)" };
    }
    if (dFloor <= NEAR) {
      return { isBorderline: true, distance: dFloor, thresholdLabel: "the low-confidence threshold (50%)" };
    }
    return { isBorderline: false, distance: null, thresholdLabel: null };
  }

  const dCeil = 50 - probability;
  return dCeil <= NEAR
    ? { isBorderline: true, distance: dCeil, thresholdLabel: "the medium-confidence threshold (50%)" }
    : { isBorderline: false, distance: dCeil, thresholdLabel: null };
}

function confidenceLabel(tier) {
  if (tier === "high") return "High Confidence";
  if (tier === "medium") return "Medium Confidence";
  return "Low Confidence";
}

/** Confidence tone reflects model *certainty*, independent of whether the
 *  outcome itself is commercially good or bad news. */
function confidenceTone(tier) {
  if (tier === "high") return "positive";
  if (tier === "medium") return "warning";
  return "negative";
}

function toneClass(tone) {
  switch (tone) {
    case "positive":
      return "aiix-tone-positive";
    case "warning":
      return "aiix-tone-warning";
    case "negative":
      return "aiix-tone-negative";
    case "info":
      return "aiix-tone-info";
    default:
      return "aiix-tone-neutral";
  }
}

/* ============================================================================
   SECTION 2 — BUSINESS RULE TABLE
   Structured, deterministic business decisions for each of the six
   scenarios (purchased/not-purchased x high/medium/low probability).
   These are DATA, not prose — the reasoning engine in Section 3 turns
   them into natural-language narrative.
============================================================================ */

const SCENARIO_DATA = {
  purchased_high: {
    decision: "Proceed – Confirmed High-Value Purchase",
    decisionTone: "positive",
    priority: "Critical (P1)",
    priorityTone: "negative",
    businessImpact: "high positive revenue impact",
    businessImpactTone: "positive",
    department: "Customer Success & Upsell",

    segment: "High-Intent Buyer",
    purchaseIntent: "very strong",
    digitalBehaviour: "highly engaged, with frequent site visits and consistent ad interaction",
    loyaltyCategory: "Premium Prospect",
    expectedCustomerValue: "high",

    campaign: "Premium Upgrade Campaign",
    channel: "Email + In-App Push",
    marketingPriority: "High",
    marketingPriorityTone: "negative",
    discount: "No discount needed",
    bestContactTime: "immediately after booking confirmation",
    expectedRoi: "high",
    expectedRoiTone: "positive",

    upsell: "seat or cabin class upgrade",
    crossSell: "lounge access and travel insurance",
    ancillary: "extra baggage, priority boarding, seat selection",
    potentialRevenue: "high",
    potentialRevenueTone: "positive",

    bookingRisk: "Low",
    retentionRisk: "Low",
    marketingRisk: "Low",
    churnRisk: "Low",
    riskTone: "positive",
  },

  purchased_medium: {
    decision: "Proceed – Purchase Likely, Reinforce & Support",
    decisionTone: "positive",
    priority: "High (P2)",
    priorityTone: "warning",
    businessImpact: "moderate positive revenue impact",
    businessImpactTone: "positive",
    department: "Customer Success",

    segment: "Likely Buyer",
    purchaseIntent: "strong",
    digitalBehaviour: "moderately engaged, showing a steady but not exhaustive browsing pattern",
    loyaltyCategory: "Growing Prospect",
    expectedCustomerValue: "medium-to-high",

    campaign: "Booking Confirmation & Upsell Campaign",
    channel: "Email",
    marketingPriority: "Medium",
    marketingPriorityTone: "warning",
    discount: "5% loyalty perk",
    bestContactTime: "within a few hours of booking",
    expectedRoi: "moderate",
    expectedRoiTone: "warning",

    upsell: "an optional seat or baggage upgrade",
    crossSell: "travel insurance and meal upgrades",
    ancillary: "seat selection and in-flight meal add-ons",
    potentialRevenue: "medium",
    potentialRevenueTone: "warning",

    bookingRisk: "Low-Medium",
    retentionRisk: "Medium",
    marketingRisk: "Low",
    churnRisk: "Medium",
    riskTone: "warning",
  },

  purchased_low: {
    decision: "Proceed with Caution – Purchase Outcome Uncertain",
    decisionTone: "warning",
    priority: "Medium (P3)",
    priorityTone: "warning",
    businessImpact: "uncertain revenue impact pending confirmation",
    businessImpactTone: "warning",
    department: "Customer Success (verification track)",

    segment: "Uncertain Buyer",
    purchaseIntent: "weak-to-moderate",
    digitalBehaviour: "inconsistent, with mixed engagement signals across sessions",
    loyaltyCategory: "Unclassified",
    expectedCustomerValue: "low-to-medium",

    campaign: "Purchase Verification Campaign",
    channel: "Email",
    marketingPriority: "Low",
    marketingPriorityTone: "neutral",
    discount: "No discount needed",
    bestContactTime: "shortly after booking, low urgency",
    expectedRoi: "low",
    expectedRoiTone: "negative",

    upsell: "hold off until intent is clearer",
    crossSell: "none recommended at this stage",
    ancillary: "none recommended at this stage",
    potentialRevenue: "low",
    potentialRevenueTone: "negative",

    bookingRisk: "Medium",
    retentionRisk: "Medium",
    marketingRisk: "Medium",
    churnRisk: "Medium",
    riskTone: "warning",
  },

  not_purchased_high: {
    decision: "Do Not Proceed – High-Confidence Non-Purchase",
    decisionTone: "negative",
    priority: "Critical (P1)",
    priorityTone: "negative",
    businessImpact: "high negative impact — confirmed revenue at risk",
    businessImpactTone: "negative",
    department: "Retention & Win-back",

    segment: "Cold Lead / Likely Churn",
    purchaseIntent: "very weak",
    digitalBehaviour: "low engagement, with a clear drop-off pattern late in the funnel",
    loyaltyCategory: "At Risk",
    expectedCustomerValue: "low without intervention",

    campaign: "Retention / Win-back Campaign",
    channel: "Email + Retargeting Ads",
    marketingPriority: "Critical",
    marketingPriorityTone: "negative",
    discount: "20% win-back discount",
    bestContactTime: "within 24 hours, before intent fully cools",
    expectedRoi: "uncertain, requiring meaningful spend to convert",
    expectedRoiTone: "negative",

    upsell: "not applicable — recovery takes priority over upsell",
    crossSell: "not applicable at this stage",
    ancillary: "bundle only as part of a win-back offer",
    potentialRevenue: "at risk, but recoverable with the right incentive",
    potentialRevenueTone: "negative",

    bookingRisk: "High",
    retentionRisk: "High",
    marketingRisk: "Medium",
    churnRisk: "High",
    riskTone: "negative",
  },

  not_purchased_medium: {
    decision: "Nurture – Not Purchased, Recoverable Lead",
    decisionTone: "warning",
    priority: "High (P2)",
    priorityTone: "warning",
    businessImpact: "moderate negative impact, still recoverable",
    businessImpactTone: "warning",
    department: "Retention / Lifecycle Marketing",

    segment: "Warm Lead",
    purchaseIntent: "moderate but unconverted",
    digitalBehaviour: "moderately engaged, with an incomplete conversion journey",
    loyaltyCategory: "Developing",
    expectedCustomerValue: "medium, conditional on follow-up",

    campaign: "Email Nurture Campaign",
    channel: "Email",
    marketingPriority: "Medium",
    marketingPriorityTone: "warning",
    discount: "10% loyalty discount",
    bestContactTime: "within 2-3 days",
    expectedRoi: "moderate",
    expectedRoiTone: "warning",

    upsell: "hold until conversion is achieved",
    crossSell: "introduce complementary travel services within nurture content",
    ancillary: "mention optional add-ons as an incentive, not an upsell",
    potentialRevenue: "medium, conditional on a timely follow-up",
    potentialRevenueTone: "warning",

    bookingRisk: "Medium",
    retentionRisk: "Medium",
    marketingRisk: "Low-Medium",
    churnRisk: "Medium",
    riskTone: "warning",
  },

  not_purchased_low: {
    decision: "Monitor – Outcome Uncertain, Light Engagement",
    decisionTone: "neutral",
    priority: "Low (P4)",
    priorityTone: "info",
    businessImpact: "low / unclear impact pending more data",
    businessImpactTone: "neutral",
    department: "Growth / Lifecycle Marketing",

    segment: "Undecided Lead",
    purchaseIntent: "unclear",
    digitalBehaviour: "insufficient or mixed signals to draw a firm conclusion",
    loyaltyCategory: "Unclassified",
    expectedCustomerValue: "unclear, needs more data",

    campaign: "Awareness / Re-engagement Campaign",
    channel: "Email",
    marketingPriority: "Low",
    marketingPriorityTone: "neutral",
    discount: "5% trial incentive",
    bestContactTime: "within a week, low urgency",
    expectedRoi: "low or unclear",
    expectedRoiTone: "neutral",

    upsell: "not recommended until intent clarifies",
    crossSell: "not recommended at this stage",
    ancillary: "not recommended at this stage",
    potentialRevenue: "unclear",
    potentialRevenueTone: "neutral",

    bookingRisk: "Medium",
    retentionRisk: "Low-Medium",
    marketingRisk: "Medium — spend may be under-utilized",
    churnRisk: "Medium",
    riskTone: "neutral",
  },
};

/* ============================================================================
   SECTION 3 — REASONING ENGINE
   Small, reusable sentence-builder functions that combine the structured
   business-rule data with the raw prediction signal to produce natural
   language. Every generateX() function below is built from these shared
   building blocks rather than a single hardcoded paragraph — swap the
   scenario data and the sentences reshape themselves accordingly.
============================================================================ */

function riskInterpretation(riskTone) {
  if (riskTone === "positive") return "these are manageable under standard monitoring";
  if (riskTone === "negative") return "these warrant immediate, coordinated intervention";
  if (riskTone === "warning") return "these call for proactive, near-term attention";
  return "these should be re-assessed as more engagement data arrives";
}

function outcomeClause(purchased) {
  return purchased ? "will complete a purchase" : "will not complete a purchase";
}

function sentenceOutcome(ctx) {
  const { purchased, probability, tier, boundary } = ctx;
  const base = `The model indicates this passenger ${outcomeClause(purchased)}, at a ${probability.toFixed(
    1
  )}% purchase probability (${confidenceLabel(tier).toLowerCase()}).`;
  if (boundary.isBorderline) {
    return `${base} This reading sits close to ${boundary.thresholdLabel}, so it should be treated as directionally reliable rather than absolute.`;
  }
  return `${base} This places the case ${certaintyLabel(ctx.certaintyScore)}, away from any tier threshold.`;
}

function sentenceSegment(ctx) {
  const d = ctx.data;
  return `This behaviour profile places the passenger in the "${d.segment}" segment, characterized by ${d.purchaseIntent} purchase intent and a digital footprint that is ${d.digitalBehaviour}.`;
}

function sentenceBusinessImpact(ctx) {
  const d = ctx.data;
  return `From a commercial standpoint, this case represents ${d.businessImpact}, and has been classified as ${d.priority.toLowerCase()} for the ${d.department} team.`;
}

function sentenceMarketing(ctx) {
  const d = ctx.data;
  const discountClause = d.discount.toLowerCase().startsWith("no discount")
    ? "without any discount"
    : `supported by a ${d.discount.toLowerCase()}`;
  return `The recommended approach is a ${d.campaign} delivered via ${d.channel}, ideally reaching the passenger ${d.bestContactTime}, ${discountClause}.`;
}

function sentenceRevenue(ctx) {
  const d = ctx.data;
  return `Revenue potential is assessed as ${d.potentialRevenue}, with ${d.upsell} and ${d.crossSell} as the primary levers, alongside ${d.ancillary}.`;
}

function sentenceRisk(ctx) {
  const d = ctx.data;
  return `Risk indicators — booking: ${d.bookingRisk}, retention: ${d.retentionRisk}, marketing: ${d.marketingRisk}, churn: ${d.churnRisk} — suggest ${riskInterpretation(
    d.riskTone
  )}.`;
}

function sentenceExpectedOutcome(ctx) {
  const d = ctx.data;
  return `If this recommendation is executed within the suggested window, the expected return is ${d.expectedRoi} ROI, with churn risk trending ${d.churnRisk.toLowerCase()}.`;
}

/* ---------------------------------------------------------------------------
   PUBLIC GENERATORS — each composes 2-4 of the sentence builders above into
   a section-specific narrative. No single function contains a hardcoded
   multi-sentence paragraph; everything is assembled at call time from the
   shared fragments and the scenario's structured data.
--------------------------------------------------------------------------- */

function generateExecutiveSummary(ctx) {
  return [sentenceOutcome(ctx), sentenceBusinessImpact(ctx), sentenceMarketing(ctx), sentenceExpectedOutcome(ctx)].join(
    " "
  );
}

function generateDecisionReasoning(ctx) {
  const d = ctx.data;
  const objective = ctx.purchased
    ? "maximize the value of a highly likely conversion"
    : "recover or qualify a passenger who is unlikely to convert without intervention";
  return [
    `The primary business objective for this case is to ${objective}.`,
    sentenceBusinessImpact(ctx),
    `Operationally, this routes to the ${d.department} function, with an execution window aligned to "${d.bestContactTime}".`,
    sentenceExpectedOutcome(ctx),
  ].join(" ");
}

function generateCustomerNarrative(ctx) {
  return [sentenceSegment(ctx), `Expected customer value is assessed as ${ctx.data.expectedCustomerValue}.`].join(" ");
}

function generateMarketingNarrative(ctx) {
  const d = ctx.data;
  return [
    sentenceMarketing(ctx),
    `This campaign is justified by ${d.purchaseIntent} purchase intent combined with ${confidenceLabel(
      ctx.tier
    ).toLowerCase()} in the underlying prediction, giving an expected ${d.expectedRoi} ROI category.`,
  ].join(" ");
}

function generateRevenueNarrative(ctx) {
  return [sentenceRevenue(ctx), `Overall recovery/upside potential is categorized as ${ctx.data.potentialRevenue}.`].join(
    " "
  );
}

function generateRiskNarrative(ctx) {
  return [sentenceRisk(ctx), `Marketing spend on this case should be sized accordingly — ${riskInterpretation(ctx.data.riskTone)}.`].join(
    " "
  );
}

function generateBehaviourAnalysis(ctx) {
  const d = ctx.data;
  return [
    `Purchase behaviour: ${d.purchaseIntent} intent, ${d.digitalBehaviour}.`,
    `Conversion likelihood is ${ctx.tier} based on the model's ${ctx.probability.toFixed(1)}% output, reflecting ${certaintyLabel(
      ctx.certaintyScore
    )}.`,
    `Business value is currently rated ${d.expectedCustomerValue}, with a ${d.churnRisk.toLowerCase()} churn risk profile.`,
  ].join(" ");
}

function generateAIExplanation(ctx) {
  const d = ctx.data;
  const separationClause = ctx.boundary.isBorderline
    ? `it sits close to ${ctx.boundary.thresholdLabel}, meaning a small shift in future behaviour could move the reading into an adjacent tier`
    : `it sits well within the ${ctx.tier}-confidence band, away from any tier threshold`;
  return [
    `The model output for this passenger is "${ctx.prediction.prediction}" at a ${ctx.probability.toFixed(
      1
    )}% purchase probability.`,
    `Interpreting the probability alone: ${separationClause}.`,
    `This does not reveal which individual input features drove the score — no feature-importance values are available — but the probability's position relative to the 50% decision boundary is what determines the "${confidenceLabel(
      ctx.tier
    )}" label and the "${d.decision}" recommendation.`,
  ].join(" ");
}

function generateRecoveryStrategy(ctx) {
  const d = ctx.data;
  if (ctx.purchased) {
    return {
      immediate: [`Confirm the booking and surface the ${d.campaign.toLowerCase()} offer`],
      h24: [`Follow up via ${d.channel} with the recommended upsell (${d.upsell})`],
      h48: [`Review engagement with the offer and adjust incentive if uptake is low`],
      longTerm: [`Enroll the passenger in the ${d.loyaltyCategory.toLowerCase()} loyalty track for future campaigns`],
    };
  }
  return {
    immediate: [`Trigger the ${d.campaign.toLowerCase()} with a ${d.discount.toLowerCase()}`],
    h24: [`Reach out via ${d.channel}, timed to "${d.bestContactTime}"`],
    h48: [`Escalate to the ${d.department} team if there has been no response`],
    longTerm: [`Feed the outcome back into the lifecycle track for future re-engagement scoring`],
  };
}

function generateTimeline(ctx) {
  const strategy = generateRecoveryStrategy(ctx);
  return [
    { label: "Now", detail: strategy.immediate[0] },
    { label: "6 Hours", detail: `Monitor initial response to the ${ctx.data.channel} touchpoint` },
    { label: "24 Hours", detail: strategy.h24[0] },
    { label: "48 Hours", detail: strategy.h48[0] },
    { label: "Final Follow-up", detail: strategy.longTerm[0] },
  ];
}

function generateManagerRecommendations(ctx) {
  const d = ctx.data;
  return [
    `Route this case to ${d.department} with a ${d.priority.toLowerCase()} handling priority.`,
    `Approve a ${d.discount.toLowerCase()} for this segment given ${d.expectedRoi} expected ROI.`,
    `Track churn risk (${d.churnRisk.toLowerCase()}) as the key indicator of whether the recommended action is working.`,
  ];
}

function generateBusinessObservations(ctx) {
  const d = ctx.data;
  const observations = [];

  if (ctx.purchased) {
    observations.push(`Purchase intent is ${d.purchaseIntent}, supporting a revenue-capture rather than recovery focus.`);
  } else {
    observations.push(`Purchase intent is ${d.purchaseIntent}; current marketing spend should prioritize retention over upselling for this case.`);
  }

  if (ctx.boundary.isBorderline) {
    observations.push(`The probability reading is close to a tier threshold — treat this classification as provisional until the next scoring pass.`);
  } else {
    observations.push(`The probability reading is well inside its tier, giving a stable basis for the recommended action.`);
  }

  observations.push(`Expected customer value is ${d.expectedCustomerValue}, which should inform how much incentive spend is justified.`);

  return observations;
}

function generateStrengths(ctx) {
  const strengths = [];
  if (ctx.tier === "high") strengths.push("Strong, consistent probability signal with minimal ambiguity");
  if (ctx.purchased) strengths.push("Positive predicted outcome supports near-term revenue capture");
  if (ctx.data.riskTone === "positive") strengths.push("Low risk profile across booking, retention, and churn indicators");
  if (!ctx.boundary.isBorderline) strengths.push("Reading sits comfortably within its confidence tier");
  if (strengths.length === 0) strengths.push("Case has been captured and routed for structured follow-up");
  return strengths;
}

function generateWeaknesses(ctx) {
  const weaknesses = [];
  if (ctx.tier === "low") weaknesses.push("Model confidence is low, increasing the chance of a borderline misclassification");
  if (!ctx.purchased) weaknesses.push("Predicted outcome is non-purchase, representing revenue at risk without intervention");
  if (ctx.data.riskTone === "negative" || ctx.data.riskTone === "warning") {
    weaknesses.push("Elevated risk indicators require dedicated follow-up resourcing");
  }
  if (ctx.boundary.isBorderline) weaknesses.push("Reading is close to a tier threshold and may shift on the next scoring pass");
  if (weaknesses.length === 0) weaknesses.push("No material weaknesses identified from the current signal");
  return weaknesses;
}

function generateNextBestActions(ctx) {
  const d = ctx.data;
  const strategy = generateRecoveryStrategy(ctx);
  return [
    strategy.immediate[0],
    strategy.h24[0],
    strategy.h48[0],
    `Position ${d.ancillary} as part of the outreach, sized to a ${d.potentialRevenue} revenue expectation`,
    strategy.longTerm[0],
  ];
}

function generateExecutiveReport(ctx) {
  const d = ctx.data;
  return {
    managementSummary: generateExecutiveSummary(ctx),
    businessConclusion: `Overall, this case carries ${d.businessImpact}, with a ${confidenceLabel(
      ctx.tier
    ).toLowerCase()} prediction and a ${d.priority.toLowerCase()} routing priority.`,
    recommendedStrategy: `${d.department} should lead with the ${d.campaign.toLowerCase()}, via ${d.channel.toLowerCase()}, ${
      d.discount.toLowerCase().startsWith("no discount") ? "without discounting" : `backed by a ${d.discount.toLowerCase()}`
    }.`,
  };
}

/* ============================================================================
   SECTION 4 — PRESENTATION HELPERS
============================================================================ */

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="aiix-section-header">
      <div className="aiix-section-icon">{icon}</div>
      <div>
        <h3 className="aiix-section-title">{title}</h3>
        {subtitle && <p className="aiix-section-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}

function DataRow({ label, value, tone }) {
  return (
    <div className="aiix-row">
      <span className="aiix-row-label">{label}</span>
      <span className={`aiix-row-value ${tone ? toneClass(tone) : ""}`}>{value}</span>
    </div>
  );
}

function NarrativeBlock({ children }) {
  return <p className="aiix-explanation-text">{children}</p>;
}

function BulletList({ items }) {
  return (
    <ul className="aiix-actions-list">
      {items.map((item, idx) => (
        <li key={idx}>
          <span className="aiix-actions-index">{idx + 1}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ============================================================================
   SECTION 5 — MAIN COMPONENT
============================================================================ */

function AIInsights({ prediction }) {
  if (!prediction) return null;

  const purchased = resolvePurchased(prediction);
  const probability = resolveProbability(prediction);
  const tier = resolveTier(probability);
  const certaintyScore = computeCertaintyScore(probability);
  const boundary = resolveBoundaryProximity(probability, tier);
  const scenarioKey = `${purchased ? "purchased" : "not_purchased"}_${tier}`;
  const data = SCENARIO_DATA[scenarioKey];

  const ctx = { prediction, purchased, probability, tier, certaintyScore, boundary, data };

  const recovery = generateRecoveryStrategy(ctx);
  const timeline = generateTimeline(ctx);
  const report = generateExecutiveReport(ctx);

  return (
    <div className="aiix-wrapper">
      <style>{`
        .aiix-wrapper {
          max-width: 900px;
          margin: 24px auto 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        }
        .aiix-section {
          background: #ffffff;
          border-radius: 16px;
          padding: 30px 32px;
          box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06);
          border: 1px solid rgba(15,23,42,0.04);
          transition: box-shadow .25s ease, transform .25s ease;
          animation: aiix-fade-in .45s ease both;
        }
        .aiix-section:hover {
          box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 16px 32px rgba(15,23,42,0.09);
        }
        .aiix-section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .aiix-section-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 10px;
          background: rgba(37, 99, 235, 0.1);
          color: #2563EB;
          font-size: 17px;
        }
        .aiix-section-title {
          font-size: 17px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.01em;
        }
        .aiix-section-subtitle {
          font-size: 13px;
          color: #64748B;
          margin-top: 2px;
        }
        .aiix-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px 24px;
          margin-bottom: 16px;
        }
        .aiix-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #E2E8F0;
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
        }
        .aiix-row:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(15,23,42,0.07);
          border-color: rgba(37,99,235,0.25);
        }
        .aiix-row-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .aiix-row-value {
          font-size: 13.5px;
          font-weight: 700;
          color: #0F172A;
          text-align: right;
        }
        .aiix-tone-positive { color: #16A34A; }
        .aiix-tone-warning { color: #B45309; }
        .aiix-tone-negative { color: #DC2626; }
        .aiix-tone-info { color: #2563EB; }
        .aiix-tone-neutral { color: #334155; }

        .aiix-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 12.5px;
          font-weight: 700;
        }
        .aiix-badge.aiix-tone-positive { background: #DCFCE7; color: #16A34A; }
        .aiix-badge.aiix-tone-warning { background: #FEF3C7; color: #B45309; }
        .aiix-badge.aiix-tone-negative { background: #FEE2E2; color: #DC2626; }
        .aiix-badge.aiix-tone-info { background: rgba(37,99,235,0.1); color: #2563EB; }
        .aiix-badge.aiix-tone-neutral { background: #E2E8F0; color: #334155; }

        .aiix-decision-banner {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 16px 18px;
          border-radius: 12px;
          margin-bottom: 20px;
          background: linear-gradient(135deg, rgba(37,99,235,0.06), rgba(79,70,229,0.06));
          border: 1px solid rgba(37,99,235,0.15);
        }
        .aiix-decision-text {
          font-size: 15px;
          font-weight: 700;
          color: #0F172A;
        }

        .aiix-explanation-text {
          font-size: 14px;
          line-height: 1.7;
          color: #334155;
          background: #f8fafc;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 18px 20px;
        }

        .aiix-actions-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .aiix-actions-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #E2E8F0;
          font-size: 13.5px;
          font-weight: 600;
          color: #0F172A;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .aiix-actions-list li:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(15,23,42,0.07);
        }
        .aiix-actions-index {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #2563EB;
          color: white;
          font-size: 12px;
          font-weight: 700;
        }

        .aiix-summary-text {
          font-size: 14.5px;
          line-height: 1.75;
          color: #0F172A;
          background: linear-gradient(135deg, rgba(37,99,235,0.05), rgba(79,70,229,0.05));
          border: 1px solid rgba(37,99,235,0.18);
          border-radius: 12px;
          padding: 20px 22px;
          font-weight: 500;
        }

        .aiix-columns {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .aiix-column-title {
          font-size: 12.5px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 8px;
        }
        .aiix-column-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .aiix-column-list li {
          font-size: 13.5px;
          color: #334155;
          padding: 10px 12px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #E2E8F0;
        }

        .aiix-timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .aiix-timeline-item {
          display: flex;
          gap: 16px;
          padding: 10px 0;
          position: relative;
        }
        .aiix-timeline-item:not(:last-child)::before {
          content: "";
          position: absolute;
          left: 11px;
          top: 34px;
          bottom: -10px;
          width: 2px;
          background: #E2E8F0;
        }
        .aiix-timeline-dot {
          width: 24px;
          height: 24px;
          min-width: 24px;
          border-radius: 50%;
          background: #2563EB;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          z-index: 1;
        }
        .aiix-timeline-label {
          font-size: 13px;
          font-weight: 700;
          color: #0F172A;
        }
        .aiix-timeline-detail {
          font-size: 13px;
          color: #64748B;
          margin-top: 2px;
        }

        @keyframes aiix-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 700px) {
          .aiix-grid, .aiix-columns { grid-template-columns: 1fr; }
          .aiix-section { padding: 24px 20px; }
          .aiix-row-value { text-align: left; }
          .aiix-row { flex-direction: column; align-items: flex-start; gap: 4px; }
        }
      `}</style>

      {/* 1. AI DECISION ENGINE */}
      <section className="aiix-section">
        <SectionHeader
          icon={<FaBrain />}
          title="AI Decision Engine"
          subtitle="Interprets the model's prediction — it never generates or overrides it"
        />
        <div className="aiix-decision-banner">
          <span className="aiix-decision-text">{data.decision}</span>
          <span className={`aiix-badge ${toneClass(data.priorityTone)}`}>{data.priority}</span>
        </div>
        <div className="aiix-grid">
          <DataRow label="Confidence" value={confidenceLabel(tier)} tone={confidenceTone(tier)} />
          <DataRow label="Business Impact" value={data.businessImpact} tone={data.businessImpactTone} />
          <DataRow label="Priority" value={data.priority} tone={data.priorityTone} />
        </div>
        <NarrativeBlock>{generateDecisionReasoning(ctx)}</NarrativeBlock>
      </section>

      {/* 2. CUSTOMER INTELLIGENCE */}
      <section className="aiix-section">
        <SectionHeader
          icon={<FaUserGroup />}
          title="Customer Intelligence"
          subtitle="Segment and behaviour profile inferred from the prediction"
        />
        <div className="aiix-grid">
          <DataRow label="Customer Segment" value={data.segment} />
          <DataRow label="Purchase Intent" value={data.purchaseIntent} />
          <DataRow label="Digital Behaviour" value={data.digitalBehaviour} />
          <DataRow label="Loyalty Status" value={data.loyaltyCategory} />
          <DataRow label="Expected Customer Value" value={data.expectedCustomerValue} />
        </div>
        <NarrativeBlock>{generateCustomerNarrative(ctx)}</NarrativeBlock>
      </section>

      {/* 3. MARKETING INTELLIGENCE */}
      <section className="aiix-section">
        <SectionHeader
          icon={<FaBullhorn />}
          title="Marketing Intelligence"
          subtitle="Recommended campaign approach aligned with the predicted outcome"
        />
        <div className="aiix-grid">
          <DataRow label="Recommended Campaign" value={data.campaign} />
          <DataRow label="Suggested Channel" value={data.channel} />
          <DataRow label="Best Contact Time" value={data.bestContactTime} />
          <DataRow label="Expected ROI" value={data.expectedRoi} tone={data.expectedRoiTone} />
        </div>
        <NarrativeBlock>{generateMarketingNarrative(ctx)}</NarrativeBlock>
      </section>

      {/* 4. REVENUE INTELLIGENCE
      <section className="aiix-section">
        <SectionHeader
          icon={<FaSackDollar />}
          title="Revenue Intelligence"
          subtitle="Upsell, cross-sell and ancillary potential"
        />
        <div className="aiix-grid">
          <DataRow label="Upsell Opportunity" value={data.upsell} />
          <DataRow label="Cross Sell Opportunity" value={data.crossSell} />
          <DataRow label="Ancillary Services" value={data.ancillary} />
          <DataRow label="Potential Revenue" value={data.potentialRevenue} tone={data.potentialRevenueTone} />
        </div>
        <NarrativeBlock>{generateRevenueNarrative(ctx)}</NarrativeBlock>
      </section> */}

      {/* 5. RISK INTELLIGENCE */}
      <section className="aiix-section">
        <SectionHeader
          icon={<FaTriangleExclamation />}
          title="Risk Intelligence"
          subtitle="Operational and marketing risk indicators"
        />
        <div className="aiix-grid">
          <DataRow label="Booking Risk" value={data.bookingRisk} tone={data.riskTone} />
          <DataRow label="Retention Risk" value={data.retentionRisk} tone={data.riskTone} />
          <DataRow label="Marketing Risk" value={data.marketingRisk} tone={data.riskTone} />
          <DataRow label="Customer Churn Risk" value={data.churnRisk} tone={data.riskTone} />
        </div>
        <NarrativeBlock>{generateRiskNarrative(ctx)}</NarrativeBlock>
      </section>

      {/* 6. AI EXPLANATION */}
      <section className="aiix-section">
        <SectionHeader
          icon={<FaCircleInfo />}
          title="AI Explanation"
          subtitle="Rule-based reasoning from prediction and probability only — no invented feature importance"
        />
        <NarrativeBlock>{generateAIExplanation(ctx)}</NarrativeBlock>
      </section>
{/* 
      7. PASSENGER BEHAVIOUR ANALYSIS */}
      {/* <section className="aiix-section">
        <SectionHeader
          icon={<FaGaugeHigh />}
          title="Passenger Behaviour Analysis"
          subtitle="Purchase behaviour, engagement and business value read-out"
        />
        <NarrativeBlock>{generateBehaviourAnalysis(ctx)}</NarrativeBlock>
      </section> */}

      {/* 8. STRENGTHS & WEAKNESSES */}
      {/* <section className="aiix-section">
        <SectionHeader
          icon={<FaClipboardList />}
          title="Business Observations"
          subtitle="Case strengths, weaknesses and notable observations"
        />
        <div className="aiix-columns">
          <div>
            <div className="aiix-column-title">Strengths</div>
            <ul className="aiix-column-list">
              {generateStrengths(ctx).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="aiix-column-title">Weaknesses</div>
            <ul className="aiix-column-list">
              {generateWeaknesses(ctx).map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ marginTop: "16px" }}>
          <div className="aiix-column-title">Observations</div>
          <ul className="aiix-column-list">
            {generateBusinessObservations(ctx).map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>
      </section> */}

      {/* 9. RECOVERY STRATEGY */}
      {/* <section className="aiix-section">
        <SectionHeader
          icon={<FaRoute />}
          title="Recovery Strategy"
          subtitle="Phased action plan from immediate response to long-term follow-up"
        />
        <div className="aiix-columns">
          <div>
            <div className="aiix-column-title">Immediate</div>
            <ul className="aiix-column-list">
              {recovery.immediate.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="aiix-column-title">Within 24 Hours</div>
            <ul className="aiix-column-list">
              {recovery.h24.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="aiix-column-title">Within 48 Hours</div>
            <ul className="aiix-column-list">
              {recovery.h48.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="aiix-column-title">Long-Term Follow-up</div>
            <ul className="aiix-column-list">
              {recovery.longTerm.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </section> */}

      {/* 10. TIMELINE */}
      {/* <section className="aiix-section">
        <SectionHeader icon={<FaGaugeHigh />} title="Timeline" subtitle="Suggested engagement sequence for this case" />
        <div className="aiix-timeline">
          {timeline.map((t, i) => (
            <div className="aiix-timeline-item" key={i}>
              <div className="aiix-timeline-dot">{i + 1}</div>
              <div>
                <div className="aiix-timeline-label">{t.label}</div>
                <div className="aiix-timeline-detail">{t.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* 11. MANAGER RECOMMENDATIONS */}
      {/* <section className="aiix-section">
        <SectionHeader
          icon={<FaListCheck />}
          title="Manager Recommendations"
          subtitle="Guidance framed for airline management decision-making"
        />
        <BulletList items={generateManagerRecommendations(ctx)} />
      </section> */}

      {/* 12. NEXT BEST ACTIONS */}
      <section className="aiix-section">
        <SectionHeader icon={<FaListCheck />} title="Next Best Actions" subtitle="Five recommended actions for this case" />
        <BulletList items={generateNextBestActions(ctx)} />
      </section>

      {/* 13. EXECUTIVE SUMMARY */}
      <section className="aiix-section">
        <SectionHeader icon={<FaFileLines />} title="Executive Summary" subtitle="Concise management-level overview" />
        <p className="aiix-summary-text">{generateExecutiveSummary(ctx)}</p>
      </section>

      {/* 14. EXECUTIVE REPORT */}
      {/* <section className="aiix-section">
        <SectionHeader
          icon={<FaFileLines />}
          title="Executive Report"
          subtitle="Management summary, business conclusion and recommended strategy"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <div className="aiix-column-title">Management Summary</div>
            <p className="aiix-explanation-text">{report.managementSummary}</p>
          </div>
          <div>
            <div className="aiix-column-title">Business Conclusion</div>
            <p className="aiix-explanation-text">{report.businessConclusion}</p>
          </div>
          <div>
            <div className="aiix-column-title">Recommended Strategy</div>
            <p className="aiix-explanation-text">{report.recommendedStrategy}</p>
          </div>
        </div>
      </section> */}
    </div>
  );
}

export default AIInsights;