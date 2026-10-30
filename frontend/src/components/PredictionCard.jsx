import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import {
  FaGaugeHigh,
  FaShieldHalved,
  FaBullhorn,
  FaUsers,
  FaTags,
  FaPercent,
  FaArrowRight,
  FaRobot,
} from "react-icons/fa6";

// probability tiers, evaluated the same way regardless of outcome
function getProbabilityTier(probability) {
  if (probability >= 80) return "high";
  if (probability >= 50) return "medium";
  return "low";
}

/**
 * Six scenarios: {purchased, not-purchased} x {high, medium, low probability}.
 * Every recommendation is written to agree with `purchased` — probability only
 * controls how strongly worded / aggressive the recommendation is within that
 * outcome, it never flips the outcome itself.
 */
function getInsights(probability, purchased) {
  const tier = getProbabilityTier(probability);

  if (purchased) {
    if (tier === "high") {
      return {
        confidence: "High Confidence",
        confidenceTier: "high",
        risk: "Low Risk",
        riskTier: "high", // low risk = favorable = green
        segment: "High-Intent Buyer",
        campaign: "Premium Upgrade Campaign",
        discount: "No Discount Needed",
        recommendation: "Strong buying signal — prioritize for premium upsell outreach",
        nextAction: "Offer premium seat / loyalty upgrade at checkout",
      };
    }
    if (tier === "medium") {
      return {
        confidence: "Medium Confidence",
        confidenceTier: "medium",
        risk: "Medium Risk",
        riskTier: "medium",
        segment: "Likely Buyer",
        campaign: "Booking Confirmation & Upsell Campaign",
        discount: "5% Loyalty Perk",
        recommendation: "Purchase likely — confirm booking and nudge toward add-ons",
        nextAction: "Send confirmation email with optional add-on offer",
      };
    }
    // purchased + low probability: model is unsure despite the outcome
    return {
      confidence: "Low Confidence",
      confidenceTier: "low",
      risk: "Medium Risk",
      riskTier: "medium",
      segment: "Uncertain Buyer",
      campaign: "Purchase Verification Campaign",
      discount: "No Discount Needed",
      recommendation: "Outcome is purchase, but model confidence is low — reduce friction and confirm details",
      nextAction: "Send booking verification / reassurance email",
    };
  }

  // not purchased
  if (tier === "high") {
    return {
      confidence: "High Confidence",
      confidenceTier: "high",
      risk: "High Risk",
      riskTier: "low", // high risk = unfavorable = red
      segment: "Cold Lead / Likely Churn",
      campaign: "Retention / Win-back Campaign",
      discount: "20% Win-back Discount",
      recommendation: "Strong signal customer will not convert — needs a real incentive to re-engage",
      nextAction: "Trigger win-back offer or retention call",
    };
  }
  if (tier === "medium") {
    return {
      confidence: "Medium Confidence",
      confidenceTier: "medium",
      risk: "Medium Risk",
      riskTier: "medium",
      segment: "Warm Lead",
      campaign: "Email Nurture Campaign",
      discount: "10% Loyalty Discount",
      recommendation: "Not converted yet but reachable — nurture with targeted email sequence",
      nextAction: "Send personalized follow-up offer",
    };
  }
  // not purchased + low probability: model isn't confident in the "no" either
  return {
    confidence: "Low Confidence",
    confidenceTier: "low",
    risk: "Low Risk",
    riskTier: "high",
    segment: "Undecided Lead",
    campaign: "Awareness / Re-engagement Campaign",
    discount: "5% Trial Incentive",
    recommendation: "Outcome uncertain — light-touch engagement to gather more signal",
    nextAction: "Send a light reminder or short preference survey",
  };
}

function PredictionCard({ prediction }) {
  if (!prediction) return null;

  const probability =
    prediction.probability ??
    prediction.confidence ??
    prediction.score ??
    0;

  const purchased =
    prediction.prediction === "Ticket Purchased" ||
    prediction.prediction === 1 ||
    prediction.prediction === true;

  const statusClass = purchased ? "purchased" : "not-purchased";
  const insights = getInsights(probability, purchased);

  return (
    <>
      <div className="prediction-card">
        <h2>Prediction Result</h2>

        <div className="prediction-status">
          <span className={`status-badge ${statusClass}`}>
            {purchased ? <FaCheckCircle /> : <FaTimesCircle />}
            {purchased ? "Likely to Purchase" : "Unlikely to Purchase"}
          </span>
          <h3 style={{ color: purchased ? "#16a34a" : "#dc2626" }}>
            {prediction.prediction}
          </h3>
        </div>

        <div className="probability-section">
          <div className="probability-label">
            <strong>Purchase Probability</strong>
            <span className="probability-value">{probability.toFixed(2)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${statusClass}`}
              style={{ width: `${probability}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="ai-insights-card">
        <div className="card-header">
          <div className="card-icon insights-icon">
            <FaRobot />
          </div>
          <div className="card-header-text">
            <h2>AI Insights</h2>
            <p className="card-desc">
              Automated recommendations generated from the prediction outcome and confidence
            </p>
          </div>
        </div>

        <div className="insights-grid">
          <div className={`insight-item tier-${insights.confidenceTier}`}>
            <div className="insight-icon">
              <FaGaugeHigh />
            </div>
            <div className="insight-copy">
              <span className="insight-label">Confidence Level</span>
              <span className="insight-value">{insights.confidence}</span>
            </div>
          </div>

          <div className={`insight-item tier-${insights.riskTier}`}>
            <div className="insight-icon">
              <FaShieldHalved />
            </div>
            <div className="insight-copy">
              <span className="insight-label">Risk Level</span>
              <span className="insight-value">{insights.risk}</span>
            </div>
          </div>

          <div className="insight-item">
            <div className="insight-icon">
              <FaBullhorn />
            </div>
            <div className="insight-copy">
              <span className="insight-label">Marketing Recommendation</span>
              <span className="insight-value">{insights.recommendation}</span>
            </div>
          </div>

          <div className="insight-item">
            <div className="insight-icon">
              <FaUsers />
            </div>
            <div className="insight-copy">
              <span className="insight-label">Customer Segment</span>
              <span className="insight-value">{insights.segment}</span>
            </div>
          </div>

          <div className="insight-item">
            <div className="insight-icon">
              <FaTags />
            </div>
            <div className="insight-copy">
              <span className="insight-label">Suggested Campaign</span>
              <span className="insight-value">{insights.campaign}</span>
            </div>
          </div>

          <div className="insight-item">
            <div className="insight-icon">
              <FaPercent />
            </div>
            <div className="insight-copy">
              <span className="insight-label">Suggested Discount</span>
              <span className="insight-value">{insights.discount}</span>
            </div>
          </div>

          <div className="insight-item next-action">
            <div className="insight-icon">
              <FaArrowRight />
            </div>
            <div className="insight-copy">
              <span className="insight-label">Next Best Action</span>
              <span className="insight-value">{insights.nextAction}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PredictionCard;