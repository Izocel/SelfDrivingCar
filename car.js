class Car{
    startTime;
    endTime;

    x;y;sx;sy;
    width;
    height;

    color;

    
    gen = -1;
    index = -1;
    speed = 0;
    angle = 0;
    maxSpeed;
    acceleration = 0.2;
    friction=0.05;

    damaged = false;
    lifetime = 0.00000000;
    linearTavelDistance = 0.00000000;

    outputsCtrl;
    mustSave = true;
    storage = "traficUpdate";


    static getBaseWidth() {
        return carCanvas.width/2 *.45;
    }

    static getBaseHeight() {
        return Car.getBaseWidth() * Car.getHWRatio();
    }

    static getHWRatio() {
        return 50/30;
    }

    static getState(car) {
        return JSON.parse(Car.toJson(car));
    }

    static toJson(car) {
        let obj = new Object();

        obj.x=car.x;
        obj.y=car.y;
        obj.sx=car.sx;
        obj.sy=car.sy;
        obj.width=car.width;
        obj.height=car.height;

        obj.gen = car.gen;
        obj.index = car.index;
        obj.startTime = car.startTime;
        obj.endTime = car.endTime;
        obj.lifetime = car.lifetime;
        obj.linearTavelDistance = car.linearTavelDistance;


        obj.speed=car.speed;
        obj.acceleration=car.acceleration;
        obj.maxSpeed=car.maxSpeed;
        obj.friction=car.friction;
        obj.angle=car.angle;
        obj.damaged=car.damaged;
        obj.controlType = car.controlType

        // parsed unatural
        if(car.controlType != "DUMMY"){
            obj.sensor = new Object();
            obj.sensor.rayCount = car.sensor.rayCount;
            obj.sensor.rayLength = car.sensor.rayLength;
            obj.sensor.raySpread = car.sensor.raySpread;
        }

        obj.storage = car.storage;
        obj.outputsCtrl = car.outputsCtrl;

        return JSON.stringify(obj);
    }
    
    constructor(x,y,width,height,controlType,maxSpeed=3,color="blue"){

        this.x=x; this.sx=x;
        this.y=y; this.sy=y;

        this.width = width || Car.getBaseWidth();
        this.height= height || Car.getBaseHeight();
        
        this.maxSpeed=maxSpeed;
        this.controlType = controlType;
        this.useBrain=this.controlType=="AI";


        if(this.controlType!="DUMMY"){
            this.storage = "aiUpdate";
            this.sensor=new Sensor(this);
            this.brain=new NeuralNetwork(
                [this.sensor.rayCount,6,4]
            );
        }
        this.controls=new Controls(controlType);

        this.img=new Image();
        this.img.src="car.png"

        this.mask=document.createElement("canvas");
        this.mask.width=this.width;
        this.mask.height=this.height;

        const maskCtx=this.mask.getContext("2d");
        this.img.onload=()=>{
            maskCtx.fillStyle=color;
            maskCtx.rect(0,0,this.width,this.height);
            maskCtx.fill();

            maskCtx.globalCompositeOperation="destination-atop";
            maskCtx.drawImage(this.img,0,0,this.width,this.height);
        }
        this.startTime = Date.now();

        this.index = this.indexToStorage();
    }

    indexToStorage() {
        const storage = this.getStorageObj();
        storage.count++;

        this.setStorageObj(storage);
        return storage.count-1;
    }

    update(roadBorders,traffic){
        if(!this.damaged){
            this.#move();
            this.polygon=this.#createPolygon();
            this.damaged=this.#assessDamage(roadBorders,traffic);
        }
        if(this.sensor){
            this.sensor.update(roadBorders,traffic);
            const offsets=this.sensor.readings.map(
                s=>s==null?0:1-s.offset
            );
            this.outputsCtrl=NeuralNetwork.feedForward(offsets,this.brain);
            const outputs = this.outputsCtrl;

            if(this.useBrain){
                this.controls.forward=outputs[0];
                this.controls.left=outputs[1];
                this.controls.right=outputs[2];
                this.controls.reverse=outputs[3];
            }
        }

        this.checkMustsave();
    }

    getStorageObj() {
        return JSON.parse(localStorage.getItem(this.storage));
    }

    setStorageObj(obj) {
        localStorage.setItem(this.storage, JSON.stringify(obj));
    }

    getSelfStoreState() {
        return this.getStorageObj().cars[this.index];
    }

    setSelfStoreState(obj) {
        const storage = this.getStorageObj();
        if(storage) {
            storage.cars[this.index] = JSON.stringify(obj);
        }
        this.setStorageObj(storage);
    }

    checkMustsave() {
        if(this.mustSave) {
            const state = Car.getState(this);
            this.setSelfStoreState(state);
            updateBestCarRow(null, this.index, state);
            this.mustSave = false;
        }
    }

    gotDamaged() {
        this.damaged = true;
        this.endTime = Date.now().toPrecision();
        this.lifetime = this.endTime - this.startTime.toPrecision();
    }

    #assessDamage(roadBorders,traffic){
        for(let i=0;i<roadBorders.length;i++){
            if(polysIntersect(this.polygon,roadBorders[i])){
                this.gotDamaged();
                return true;
            }
        }
        for(let i=0;i<traffic.length;i++){
            if(polysIntersect(this.polygon,traffic[i].polygon)){
                this.gotDamaged();
                return true;
            }
        }
        return false;
    }

    #createPolygon(){
        const points=[];
        const rad=Math.hypot(this.width,this.height)/2;
        const alpha=Math.atan2(this.width,this.height);
        points.push({
            x:this.x-Math.sin(this.angle-alpha)*rad,
            y:this.y-Math.cos(this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        });
        return points;
    }

    #move(){
        if(this.controls.forward){
            this.speed+=this.acceleration;
        }
        if(this.controls.reverse){
            this.speed-=this.acceleration;
        }

        if(this.speed>this.maxSpeed){
            this.speed=this.maxSpeed;
        }
        if(this.speed<-this.maxSpeed/2){
            this.speed=-this.maxSpeed/2;
        }

        if(this.speed>0){
            this.speed-=this.friction;
        }
        if(this.speed<0){
            this.speed+=this.friction;
        }
        if(Math.abs(this.speed)<this.friction){
            this.speed=0;
        }

        if(this.speed!=0){
            const flip=this.speed>0?1:-1;
            if(this.controls.left){
                this.angle+=0.03*flip;
            }
            if(this.controls.right){
                this.angle-=0.03*flip;
            }
        }

        this.x-=Math.sin(this.angle)*this.speed;
        this.y-=Math.cos(this.angle)*this.speed;
    }

    draw(ctx,drawSensor=false){
        if(this.sensor && drawSensor){
            this.sensor.draw(ctx);
        }

        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(-this.angle);
        if(!this.damaged){
            ctx.drawImage(this.mask,
                -this.width/2,
                -this.height/2,
                this.width,
                this.height);
            ctx.globalCompositeOperation="multiply";
        }
        ctx.drawImage(this.img,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height);
        ctx.restore();

    }
}