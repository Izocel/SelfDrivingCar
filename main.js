const carCanvas=document.getElementById("carCanvas");
carCanvas.width=window.innerWidth/3;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=window.innerWidth/3;


const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road=new Road(carCanvas.width/2,carCanvas.width*0.9);

const NUMBEROFTRAFFIC=7;
const NUMBEROFAI=100;

localStorage.setItem("aiUpdate", JSON.stringify({"count":0,"cars":new Array(NUMBEROFAI)}));
localStorage.setItem("traficUpdate", JSON.stringify({"count":0,"cars":new Array(NUMBEROFTRAFFIC)}));

const cars=generateCars(NUMBEROFAI);
let bestCar=cars[0];
if(localStorage.getItem("bestBrain")){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain"));
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain,0.25,0.25);
        }
    }
}


const carsDelta3 = Car.getBaseHeight()*2;
const carsDelta5 = Car.getBaseHeight()*6;
const carsDelta7 = Car.getBaseHeight()*9;
const carsDelta8 = Car.getBaseHeight()*12;


const traffic=[
    new Car(road.getLaneCenter(1),-carsDelta3,null,null,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(0),-carsDelta5,null,null,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(2),-carsDelta5,null,null,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(0),-carsDelta7,null,null,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(1),-carsDelta7,null,null,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(1),-carsDelta8,null,null,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(2),-carsDelta8,null,null,"DUMMY",2,getRandomColor()),
];

animate();

function reloadWindow() {
    window.location = window.location;
}

function save(id){
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
    localStorage.setItem("bestCar",
        Car.toJson(bestCar));
}

function saveAll(){
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
    localStorage.setItem("bestCar",
        Car.toJson(bestCar));
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function generateCars(NUMBEROF){
    const cars=[];
    for(let i=1;i<=NUMBEROF;i++){
        const newCar = new Car(road.getLaneCenter(1),100,null,null,"AI");
        cars.push(newCar);
    }
    return cars;
}



function animate(time){
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }
    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders,traffic);
    }
    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        ));
    
    carCanvas.width=window.innerWidth/3;
    carCanvas.height=window.innerHeight;

    networkCanvas.width=window.innerWidth/3;
    networkCanvas.height=window.innerHeight;

    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

    road.draw(carCtx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx);
    }
    carCtx.globalAlpha=0.2;
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,true);

    carCtx.restore();

    networkCtx.lineDashOffset=-time/150;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);

    
    updateLocalStorage();
    requestAnimationFrame(animate);
}

var oldTime = Date.now();
function updateLocalStorage(sleepTime = 5000) {

    if(Date.now() - oldTime >= sleepTime) {

        cars.forEach(car => {
            car.mustSave = true;
        });
        traffic.forEach(car => {
            car.mustSave = true;
        });
        
        oldTime = Date.now();
    }
}