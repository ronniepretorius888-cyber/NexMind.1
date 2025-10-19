export function loadFundingButtons() {
  const fundingContainer = document.getElementById("funding");

  fundingContainer.innerHTML = `
    <h3>Support NexMind.One</h3>
    <button id="donate-payfast">💸 Fund via PayFast</button>
    <button id="donate-email">📧 Contact Me</button>
  `;

  // PayFast button
  document.getElementById("donate-payfast").addEventListener("click", () => {
    window.open("https://www.payfast.co.za/eng/process", "_blank");
  });

  // Email contact button
  document.getElementById("donate-email").addEventListener("click", () => {
    window.location.href = "mailto:ronniepretorius40@gmail.com?subject=Funding NexMind.One";
  });
}

window.addEventListener("DOMContentLoaded", loadFundingButtons);