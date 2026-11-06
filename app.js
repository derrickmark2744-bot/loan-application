
const form = document.getElementById("loanForm");
const statusMessage = document.getElementById("status");

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "Submitting...";

    const application = {
        fullName: document.getElementById("fullName").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        income: document.getElementById("income").value,
        loanAmount: document.getElementById("loanAmount").value,
        repaymentPeriod: document.getElementById("repaymentPeriod").value,
        purpose: document.getElementById("purpose").value.trim(),
        consent: document.getElementById("consent").checked
    };

    try {
        const response = await fetch("/api/applications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(application)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Submission failed.");
        }

        statusMessage.textContent = result.message;
        statusMessage.style.color = "green";
        form.reset();

    } catch (error) {
        statusMessage.textContent = error.message;
        statusMessage.style.color = "red";

    } finally {
        button.disabled = false;
        button.textContent = "🚀 Submit Application";
    }
});
