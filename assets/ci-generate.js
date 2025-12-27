/**
 * Dingfelder Enterprises — CI Generate client helper
 * Usage (after login):
 *   const out = await DEGenerateCI({ method: "Pareto → Action Plan" });
 */
window.DEGenerateCI = async function (payload = {}) {
  if (!window.netlifyIdentity) {
    throw new Error("Netlify Identity not loaded");
  }

  const user = netlifyIdentity.currentUser();
  if (!user) {
    throw new Error("User not logged in");
  }

  const token = await user.jwt();

  const res = await fetch("/.netlify/functions/ci-generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Generation failed");
  }

  return data;
};
