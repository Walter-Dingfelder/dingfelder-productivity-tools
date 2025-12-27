const jwt = require("jsonwebtoken");

function response(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: JSON.stringify(body)
  };
}

function cors(origin = "*") {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
}

function buildMockOutput(payload) {
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    method: payload.method || "Pareto → Action Plan",

    charts: [
      {
        type: "pareto",
        title: "Top Loss Drivers",
        data: [
          { label: "Changeover", value: 42 },
          { label: "Label Wrinkles", value: 27 },
          { label: "Downtime", value: 19 },
          { label: "Other", value: 12 }
        ]
      }
    ],

    worksheet: {
      problem: "Unplanned downtime and inconsistent changeovers",
      currentCondition: "High variation by shift and SKU",
      targetCondition: "Reduce average changeover time by 20%",
      rootCauses: [
        "No standardized changeover process",
        "Tool staging inconsistent",
        "Label setup not verified"
      ],
      countermeasures: [
        "Standard checklist",
        "Pre-stage carts",
        "Visual setup standards"
      ],
      verification: "Weekly review of run charts"
    }
  };
}

exports.handler = async (event) => {
  const origin = event.headers.origin || "*";

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors(origin), body: "" };
  }

  if (event.httpMethod !== "POST") {
    return response(405, { error: "POST only" }, cors(origin));
  }

  const auth = event.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return response(401, { error: "Missing auth token" }, cors(origin));
  }

  const token = auth.replace("Bearer ", "");
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return response(500, { error: "JWT_SECRET is not set in environment variables" }, cors(origin));
  }

  let user;
  try {
    user = jwt.verify(token, secret);
  } catch (e) {
    return response(401, { error: "Invalid token" }, cors(origin));
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return response(400, { error: "Invalid JSON" }, cors(origin));
  }

  const output = buildMockOutput(payload);

  return response(
    200,
    {
      ...output,
      user: {
        email: user.email || "unknown"
      }
    },
    cors(origin)
  );
};
