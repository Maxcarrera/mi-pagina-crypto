async function fetchProposals() {
    const query = `
    {
      proposals(first: 5, orderBy: startBlock, orderDirection: desc) {
        id
        description
        state
      }
    }`;

    const url = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-governance-v3";
    
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
    });

    const data = await response.json();
    return data.data.proposals;
}

async function displayProposals() {
    const proposals = await fetchProposals();
    const list = document.getElementById("proposals-list");

    list.innerHTML = ""; // Limpiar la lista antes de agregar nuevas propuestas

    proposals.forEach(proposal => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${proposal.id}</strong>: ${proposal.description} - <em>${proposal.state}</em>`;
        list.appendChild(li);
    });
}

// Ejecutar cuando se cargue la página
document.addEventListener("DOMContentLoaded", displayProposals);
