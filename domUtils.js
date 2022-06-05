const BESTCARSTABLE = "bestCarsTable";
const BESTPOSITIONCOLOR = "green";
const CTRLACTIVECLASS = "active";
const ROWPOSITIONID = "pos-";

function getBestCarsTable() {
    return document.getElementById(BESTCARSTABLE);
}

function getBestCarRow(id) {
    return getBestCarsTable().querySelector("tbody tr#pos-"+id);
}

function updateBestCarRow(row, id, state) {
    try {
        id = id || row?.id || null;
        row = row || getBestCarRow(id);

        if(!row) return;

        const isActive =  !state.damaged;
        const idx =  state.index;
        const posNo =  state.position;
        const x =  state.x;
        const y =  state.y;
        const ctrls =  state.outputsCtrl;

        

        

        


    } catch (error) {
        console.error(error);
    }
}