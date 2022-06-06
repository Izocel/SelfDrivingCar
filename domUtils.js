const BESTCARSTABLE = "bestCarsTable";
const BESTPOSITIONCOLOR = "green";
const CTRLACTIVECLASS = "active";
const ROWPOSITIONID = "pos-";

const STATEIDS = [
    "position",
    "brainNo",
    "brainGen",
    "position",
    "ctrls",
    "speed",
    "lifetime",
    "distance",
    "avgSpeed",

    "actions"
]

function getBestCarsTable() {
    return document.getElementById(BESTCARSTABLE);
}

function getBestCarRow(id) {
    return getBestCarsTable().querySelector("tbody tr#pos-"+id);
}

function getColIndex(name) {
    return document.getElementById(name);
}

function getCellData(row, state) {
    getColIndex()
}

function updateBestCarRow(row, id, state) {
    try {
        const table = getBestCarsTable();
        id = id || row?.id || null;
        row = row || getBestCarRow(id);


        if(!row) return;


        const posNo =  state.position;
        const brainNo =  state.gen;
        const gen =  state.gen;
        const speed =  state.speed;
        const avgSpeed =  state.speed;
        const lifetime =  state.lifetime;
        const distance = state.linearTavelDistance

        const stateMap = {
                "position" : posNo,
                "brainNo"  : brainNo,
                "brainGen" : gen,
                "position" : posNo,
                "speed"    : speed,
                "lifetime" : lifetime,
                "distance" : distance,
                "avgSpeed" : avgSpeed,
        };

        const cells = row.querySelectorAll('tbody td');
        const heads = table.querySelectorAll('thead th');
        let count = 0;
        heads.forEach(head => {
            const id = head.id;
            const value = stateMap[id]?.toString();
            if(value) {
                cells[count].textContent = value.toString();
            }
            count++;
        });

        const x =  state.x;
        const y =  state.y;
        const ctrls =  state.outputsCtrl;
        const damaged =  state.damaged;
        const idx =  state.index;

        if(damaged)
            row.classList.add('text-danger');
        else
            row.classList.remove('text-danger');

        

        

        


    } catch (error) {
        console.error(error);
    }
}