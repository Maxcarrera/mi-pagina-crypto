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
async function checkOsmosis() {
    const address = document.getElementById("osmosis-address").value.trim();
    const resultDiv = document.getElementById("osmosis-result");

    if (!address.startsWith("osmo")) {
        resultDiv.innerHTML = "❌ Dirección inválida. Debe empezar con 'osmo'.";
        return;
    }

    resultDiv.innerHTML = "⏳ Consultando balance...";

    try {
        const response = await fetch(`https://rest.cosmos.directory/osmosis/cosmos/bank/v1beta1/balances/${address}`);
        const data = await response.json();

        if (!data.balances || data.balances.length === 0) {
            resultDiv.innerHTML = "⚠️ No se encontraron balances para esta dirección.";
            return;
        }

        // Buscar OSMO
        const osmoBalance = data.balances.find(b => b.denom === "uosmo");
        const amount = osmoBalance ? (parseInt(osmoBalance.amount) / 1_000_000).toFixed(2) : 0;

        resultDiv.innerHTML = `✅ Balance en OSMO: <strong>${amount}</strong>`;
    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = "❌ Error al consultar la API de Osmosis.";
    }
}
