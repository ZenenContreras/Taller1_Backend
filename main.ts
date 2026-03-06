export interface RawMonsterInfo {
    url: string;
}

export interface NormalizedMonster {
    index: string;
    name: string;
    size: string;
    type: string;
    alignment: string;
    cr: number;
    ac: number;
    hp: number;
    speed: number;
    stats: {
        str: number;
        dex: number;
        con: number;
        int: number;
        wis: number;
        cha: number;
    };
    immuneCount: number;
    resistCount: number;
    vulnCount: number;
    hasLegendary: boolean;
}

export interface TypeStats {
    count: number;
    maxHP: number;
    totalCR?: number;
    avgCR?: number;
}

export const normalizeMonster = (m: any): NormalizedMonster => {
    const acValue = Array.isArray(m.armor_class)
        ? m.armor_class[0]?.value
        : m.armor_class;

    const speedValues = Object.values(m.speed || {}).map(s => parseInt(s as string) || 0);
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

export async function getNormalizedMonsters(limit: number = 40): Promise<NormalizedMonster[]> {
    try {
        const response = await fetch('https://www.dnd5eapi.co/api/monsters');
        const { results } = await response.json();

        const detailPromises = results.slice(0, limit).map(async (m: RawMonsterInfo) => {
            const res = await fetch(`https://www.dnd5eapi.co${m.url}`);
            return res.json();
        });

        const rawMonsters = await Promise.all(detailPromises);
        const normalizedData = rawMonsters.map(normalizeMonster);

        return normalizedData;

    } catch (error) {
        console.error("Error procesando monstruos:", error);
        return [];
    }
}

const main = async () => {
    console.log("Cargando y normalizando monstruos...");
    const normalizedData = await getNormalizedMonsters(40);

    if (!normalizedData || normalizedData.length === 0) {
        console.log("No se obtuvieron datos.");
        return;
    }

    console.log("\n--- RESULTADOS PARTE B ---");

    // 1. Filter: Tanques de nivel medio/alto
    const heavyHitters = normalizedData.filter(m => m.cr >= 5 && m.hp >= 80);
    console.log("1. Heavy Hitters (CR >= 5 y HP >= 80):", heavyHitters.length);

    // 2. Find: El primer dragón relevante
    const firstBigDragon = normalizedData.find(m => m.type === "dragon" && m.cr >= 6);
    console.log("2. Primer Dragón >= CR 6:", firstBigDragon?.name || "No encontrado");

    // 3. Some: ¿Hay leyendas?
    const hasLegendary = normalizedData.some(m => m.hasLegendary);
    console.log("3. ¿Hay legendarios?:", hasLegendary);

    // 4. Every: Integridad de datos
    const areDataValid = normalizedData.every(m =>
        Object.keys(m.stats).length === 6 && m.hp > 0
    );
    console.log("4. ¿Datos válidos? (6 stats y HP > 0):", areDataValid);

    // 5. Reduce: Agrupación por Tipo
    const statsByType = normalizedData.reduce((acc: Record<string, TypeStats>, m) => {
        if (!acc[m.type]) {
            acc[m.type] = { count: 0, totalCR: 0, maxHP: 0 };
        }
        acc[m.type].count++;
        acc[m.type].totalCR! += m.cr;
        acc[m.type].maxHP = Math.max(acc[m.type].maxHP, m.hp);
        return acc;
    }, {});

    // Calcular el promedio y limpiar totalCR para mejor presentación
    Object.keys(statsByType).forEach(type => {
        const stat = statsByType[type];
        stat.avgCR = Number((stat.totalCR! / stat.count).toFixed(1));
        delete stat.totalCR;
    });
    console.log("5. Estadísticas por Tipo:", statsByType);

    // 6. Reduce: Buckets de CR
    const crDistribution = normalizedData.reduce((acc: Record<string, number>, m) => {
        const bucket = m.cr <= 1 ? "0-1" : m.cr <= 4 ? "2-4" : m.cr <= 9 ? "5-9" : "10+";
        acc[bucket]++;
        return acc;
    }, { "0-1": 0, "2-4": 0, "5-9": 0, "10+": 0 });

    console.log("6. Distribución por CR:", crDistribution);
};

main();
