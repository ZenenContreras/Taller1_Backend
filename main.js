const BASE_URL = 'https://www.dnd5eapi.co/api/monsters';

async function fetchMonsters (Limit = 40) {
    try {

        const response = await fetch(BASE_URL)
        if (!response.ok) throw new Error('Error al obtener la lista')
        const data = await response.json();

        const selectedMonsters = data.results.slice(0, Limit);

        const detailPromises = selectedMonsters.map(async (monster) => {
            try {
                const detailRes = await fetch(`https://www.dnd5eapi.co${monster.url}`);

                if (!detailRes.ok) return null;

                return await detailRes.ok ? detailRes.json() : null;

            } catch (err) {
                console.error(`Error con el monstruo ${monster.index}:`, err);
                return null;
            }
        });

        const monstersDetails = await Promise.all(detailPromises);

        console.log(monstersDetails)
        
    } catch (error) {
        console.error('Error fetching datos: ', error)
    }
}

fetchMonsters(40)