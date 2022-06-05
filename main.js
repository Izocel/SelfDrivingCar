const carCanvas=document.getElementById("carCanvas");
carCanvas.width=window.innerWidth/3;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=window.innerWidth/3;


const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road=new Road(carCanvas.width/2,carCanvas.width*0.9);

const N=100;
const cars=generateCars(N);
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

function save(){
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function generateCars(N){
    const cars=[];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLaneCenter(1),100,null,null,"AI"));
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
    requestAnimationFrame(animate);
}