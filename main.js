const normalizeMonster = (m) => {

    const acValue = Array.isArray(m.armor_class) 
    ? m.armor_class[0]?.value 
    : m.armor_class;

  const speedValues = Object.values(m.speed || {}).map(s => parseInt(s) || 0);
  const maxSpeed = Math.max(...speedValues, 0);

  return {
    index: m.index,
    name: m.name,
    size: m.size,
    type: m.type,
    alignment: m.alignment,
    cr: m.challenge_rating,
    ac: acValue,
    hp: m.hit_points,
    speed: maxSpeed,
    stats: {
      str: m.strength,
      dex: m.dexterity,
      con: m.constitution,
      int: m.intelligence,
      wis: m.wisdom,
      cha: m.charisma
    },
    immuneCount: m.damage_immunities?.length || 0,
    resistCount: m.damage_resistances?.length || 0,
    vulnCount: m.damage_vulnerabilities?.length || 0,
    hasLegendary: (m.legendary_actions?.length || 0) > 0
  };
};

// Integración en la función principal
async function getNormalizedMonsters(limit = 40) {
  try {
    const response = await fetch('https://www.dnd5eapi.co/api/monsters');
    const { results } = await response.json();

    const detailPromises = results.slice(0, limit).map(async (m) => {
      const res = await fetch(`https://www.dnd5eapi.co${m.url}`);
      return res.json();
    });

    const rawMonsters = await Promise.all(detailPromises);

    // Aplicamos la normalización con .map()
    const normalizedData = rawMonsters.map(normalizeMonster);

    console.log(normalizedData);
    return normalizedData;
    
  } catch (error) {
    console.error("Error procesando monstruos:", error);
  }
}

getNormalizedMonsters(40);