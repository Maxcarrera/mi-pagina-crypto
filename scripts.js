document.addEventListener("DOMContentLoaded", async function() {
    const proposalsList = document.getElementById("proposals-list");
    proposalsList.innerHTML = "Cargando propuestas...";

    try {
        const uniswapProposals = await fetchUniswapProposals();
        const aaveProposals = await fetchAaveProposals();

        const allProposals = [...uniswapProposals, ...aaveProposals].sort((a, b) => new Date(b.date) - new Date(a.date));

        proposalsList.innerHTML = "";
        allProposals.forEach(proposal => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${proposal.title}</strong> - ${proposal.status} <br> ${proposal.date}`;
            proposalsList.appendChild(li);
        });
    } catch (error) {
        proposalsList.innerHTML = "Error al cargar propuestas.";
    }
});

async function fetchUniswapProposals() {
    const response = await fetch("https://api.tally.xyz/query", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Api-Key": "TU_API_KEY"
        },
        body: JSON.stringify({
            query: "{ proposals(chainId: 1, first: 5) { id title state createdAt } }"
        })
    });

    const data = await response.json();
    return data.data.proposals.map(proposal => ({
        title: proposal.title,
        status: proposal.state,
        date: new Date(proposal.createdAt * 1000).toLocaleDateString()
    }));
}

async function fetchAaveProposals() {
    const response = await fetch("https://api.tally.xyz/query", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Api-Key": "TU_API_KEY"
        },
        body: JSON.stringify({
            query: "{ proposals(chainId: 137, first: 5) { id title state createdAt } }"
        })
    });

    const data = await response.json();
    return data.data.proposals.map(proposal => ({
        title: proposal.title,
        status: proposal.state,
        date: new Date(proposal.createdAt * 1000).toLocaleDateString()
    }));
}
