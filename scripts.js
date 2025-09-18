// scripts.js

// ---- Código original que intentaba leer propuestas desde Tally (guardado pero protegido) ----
document.addEventListener("DOMContentLoaded", async function() {
    const proposalsList = document.getElementById("proposals-list");
    if (!proposalsList) return; // si la página no tiene esa sección, salimos

    proposalsList.innerHTML = "Cargando propuestas...";

    // Si no pones tu API KEY, no tratamos de consultar Tally (evita errores en consola)
    const TALLY_API_KEY = "TU_API_KEY"; // reemplaza aquí si tienes key

    try {
        if (TALLY_API_KEY === "TU_API_KEY") {
            proposalsList.innerHTML = "<li>No hay API key de Tally configurada. Agrega tu API Key en scripts.js para ver propuestas reales.</li>";
            return;
        }

        const uniswapProposals = await fetchUniswapProposals(TALLY_API_KEY);
        const aaveProposals = await fetchAaveProposals(TALLY_API_KEY);

        const allProposals = [...uniswapProposals, ...aaveProposals].sort((a, b) => new Date(b.date) - new Date(a.date));

        proposalsList.innerHTML = "";
        allProposals.forEach(proposal => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${proposal.title}</strong> - ${proposal.status} <br> ${proposal.date}`;
            proposalsList.appendChild(li);
        });
    } catch (error) {
        console.error(error);
        proposalsList.innerHTML = "<li>Error al cargar propuestas.</li>";
    }
});

async function fetchUniswapProposals(apiKey) {
    const response = await fetch("https://api.tally.xyz/query", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Api-Key": apiKey
        },
        body: JSON.stringify({
            query: "{ proposals(chainId: 1, first: 5) { id title state createdAt } }"
        })
    });

    const data = await response.json();
    return (data.data.proposals || []).map(proposal => ({
        title: proposal.title,
        status: proposal.state,
        date: new Date(proposal.createdAt * 1000).toLocaleDateString()
    }));
}

async function fetchAaveProposals(apiKey) {
    const response = await fetch("https://api.tally.xyz/query", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Api-Key": apiKey
        },
        body: JSON.stringify({
            query: "{ proposals(chainId: 137, first: 5) { id title state createdAt } }"
        })
    });

    const data = await response.json();
    return (data.data.proposals || []).map(proposal => ({
        title: proposal.title,
        status: proposal.state,
        date: new Date(proposal.createdAt * 1000).toLocaleDateString()
    }));
}

// ---- Nueva función: checkOsmosis ----
// Esta función consulta el endpoint público y muestra el resultado en #osmosis-result.
// No necesita API key.
async function checkOsmosis(address) {
    const resultDiv = document.getElementById("osmosis-result");
    if (!resultDiv) return;

    if (!address || !address.startsWith("osmo")) {
        resultDiv.innerHTML = "<p style='color:red;'>❌ Dirección inválida. Debe iniciar con 'osmo'.</p>";
        return;
    }

    resultDiv.innerHTML = "⏳ Consultando balance...";

    try {
        // endpoint público (rest.cosmos.directory) - si se cae, intenta cambiar a otro nodo
        const url = `https://rest.cosmos.directory/osmosis/cosmos/bank/v1beta1/balances/${address}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error("Error en la petición: " + res.status);
        }
        const data = await res.json();

        if (!data.balances || data.balances.length === 0) {
            resultDiv.innerHTML = "<p>⚠️ No se encontraron balances para esta dirección.</p>";
            return;
        }

        // denom uosmo -> dividir por 1_000_000 para mostrar OSMO
        const osmoBalance = data.balances.find(b => b.denom === "uosmo");
        const amount = osmoBalance ? (parseInt(osmoBalance.amount, 10) / 1000000) : 0;

        resultDiv.innerHTML = `<p>✅ Balance en OSMO: <strong>${amount}</strong></p>`;
    } catch (err) {
        console.error(err);
        resultDiv.innerHTML = "<p style='color:red;'>❌ Error al consultar la API de Osmosis. Revisa la consola del navegador.</p>";
    }
}

