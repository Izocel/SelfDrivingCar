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

function updateBestCarRow(row, id) {
    try {
        id = id || row?.id || null;
        row = row || getBestCarRow(id);

        if(!row) return;

        //console.log(row);
        

        

        


    } catch (error) {
        console.error(error);
    }
}