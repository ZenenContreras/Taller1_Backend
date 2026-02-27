#  D&D 5e Monster API Processor

Script avanzado en JavaScript para la extracción, normalización y análisis de datos desde la [D&D 5e API](https://www.dnd5eapi.co/).

## Características Técnicas
- **Asincronismo:** Gestión de peticiones con `async/await` y `try/catch`.
- **Rendimiento:** Carga masiva de detalles mediante `Promise.all` y `slice`.
- **Data Wrangling:** Normalización de campos inconsistentes (AC, Max Speed) mediante `.map()`.

## Análisis de Datos (Array Methods)
El script procesa la información aplicando lógica funcional:
* **Filtrado:** Segmentación por $CR \geq 5$ y $HP \geq 80$.
* **Búsqueda:** Localización del primer espécimen tipo "dragon".
* **Validación:** Uso de `some` y `every` para auditoría de integridad de datos.
* **Agregación:** Doble `reduce` para generar:
    * Métricas por tipo (Promedio de CR y HP máximo).
    * Distribución de dificultad en "Buckets" (0-1, 2-4, 5-9, 10+).

## Uso
1. Ejecuta `getNormalizedMonsters(N)` para obtener los datos.
2. Las consultas de la **Parte B** se ejecutan sobre el resultado procesado.

```javascript
// Ejemplo de ejecución
const data = await getNormalizedMonsters(40);
console.table(data);
