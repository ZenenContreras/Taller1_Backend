//Constante de normalizacion de monster para PARTE A en funcion de fetch de monstruos

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

// Integración en la función principal FETCH de monstruos
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

(async () => {
  // 1. Cargamos y normalizamos
  const normalizedData = await getNormalizedMonsters(40);

  if (!normalizedData) return;

  console.log("--- RESULTADOS PARTE B ---");

  // 1. Filter: Tanques de nivel medio/alto
  const heavyHitters = normalizedData.filter(m => m.cr >= 5 && m.hp >= 80);
  console.log("Heavy Hitters:", heavyHitters.length);

  // 2. Find: El primer dragón relevante
  const firstBigDragon = normalizedData.find(m => m.type === "dragon" && m.cr >= 6);
  console.log("Primer Dragón >= CR 6:", firstBigDragon?.name || "No encontrado");

  // 3. Some: ¿Hay leyendas?
  console.log("¿Hay legendarios?:", normalizedData.some(m => m.hasLegendary));

  // 4. Every: Integridad de datos
  console.log("¿Datos válidos?:", normalizedData.every(m => 
    Object.keys(m.stats).length === 6 && m.hp > 0
  ));

  // 5. Reduce: Agrupación por Tipo
  const statsByType = normalizedData.reduce((acc, m) => {
    if (!acc[m.type]) acc[m.type] = { count: 0, totalCR: 0, maxHP: 0 };
    acc[m.type].count++;
    acc[m.type].totalCR += m.cr;
    acc[m.type].maxHP = Math.max(acc[m.type].maxHP, m.hp);
    return acc;
  }, {});

  Object.keys(statsByType).forEach(type => {
    statsByType[type].avgCR = Number((statsByType[type].totalCR / statsByType[type].count).toFixed(1));
    delete statsByType[type].totalCR;
  });
  console.log("Estadísticas por Tipo:", statsByType);

  // 6. Reduce: Buckets de CR
  const crDistribution = normalizedData.reduce((acc, m) => {
    const bucket = m.cr <= 1 ? "0-1" : m.cr <= 4 ? "2-4" : m.cr <= 9 ? "5-9" : "10+";
    acc[bucket]++;
    return acc;
  }, { "0-1": 0, "2-4": 0, "5-9": 0, "10+": 0 });

  console.log("Distribución por CR:", crDistribution);

})();