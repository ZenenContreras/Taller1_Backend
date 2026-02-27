async function getMonsters () {
    try {
       const res = await fetch('https://www.dnd5eapi.co/api/monsters')  
       const data = await res.json()
       console.log(data)

    } catch (error) {
        console.error('Error Fetching data: ', error)
    }
}

getMonsters()