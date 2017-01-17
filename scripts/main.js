//import { createC } from '.\helper\lib_create.js';

//Bugs:
//Safari keeps track of last graph
//
//ToDo:
//Input energy for different states
//Change ball colour when enough energy (speed)
//Separate collision math into own Module: collision module //for the phyics
//Create module for analysis of balls (energy, bonds, etc): analysisModule -> for the analysis
//
//checkbox for random size



var canvas = document.getElementById("backgroundCanvas");
canvas.width = window.innerWidth*0.70;
canvas.height = window.innerHeight*0.70;

//document.write(canvas.height);
//document.write(canvas.width);


//related to the creating container, balls, and changing their properties
var containerModule = (function(controllerModule, canvas) {

    function min( a, b ){
        if (a < b){
            return a;
        } else{
            return b;
        }
    }

    function max( a, b ){
        if (a < b){
            return b;
        } else{
            return a;
        }
    }

    function random_sign(){
        if (Math.random() > 0.5){
            return "pos";
        } else{
            return "neg";
        }
    }

    var circle_arr = []; //array of type circles

    var container = {
        minx: 1,
        miny: 1, 
        w: canvas.width,
        h: canvas.height,
        vel: 0,
        col: "rgba(134, 30, 252, 1)",
        dragTL: false,
        dragTR: false,
        dragBL: false,
        dragBR: false,
    };

    function draw_container(container, ctx){
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = container.col;
        ctx.lineWidth = "10";
        ctx.rect(container.minx, container.miny, container.w, container.h);
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = container.col;
        ctx.beginPath()
        ctx.arc(container.minx, container.miny, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = container.col;
        ctx.beginPath()
        ctx.arc(container.minx, container.miny + container.h, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = container.col;
        ctx.beginPath()
        ctx.arc(container.minx + container.w, container.miny, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = container.col;
        ctx.beginPath()
        ctx.arc(container.minx + container.w, container.miny + container.h, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }
    
    //private constructor to create Circle
    function Circle(name, canvas) {
        this.name = name;
        this.colour = "rgb(255, 77, 77)";
        this.rad = 10;//Math.random()*10 + 10;
        this.posx = Math.random()*(canvas.width - this.rad*2) + this.rad;
        this.posy = Math.random()*(canvas.height - this.rad*2) + this.rad;
        this.velx = Math.random()*20 - 10;
        this.vely = Math.random()*20 - 10;
        this.mass = Math.pow(this.rad, 2);
    }

    function add_event_listener() {
        canvas.addEventListener('mousedown', mouseDown, false);
        canvas.addEventListener('mouseup', mouseUp, false);
        canvas.addEventListener('mousemove', mouseMove, false);
    }

    function mouseDown(e) {
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;

        if (checkClose(mouseX, container.minx) && checkClose(mouseY, container.miny)){
            container.dragTL = true;
        } else if (checkClose(mouseX, container.w) && checkClose(mouseY, container.miny)){
            container.dragTR = true;
        } else if (checkClose(mouseX, container.minx) && checkClose(mouseY, container.h)){
            container.dragBL = true;
        } else if (checkClose(mouseX, container.w) && checkClose(mouseY, container.h)){
            container.dragBR = true;
        } else{
        }
    }

    function mouseUp(e){
        container.dragBL = container.dragBR = container.dragTL = container.dragTR = false;
    }

    function mouseMove(e){
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;

        if (container.dragTL){
            container.w += (container.minx - mouseX);
            container.h += (container.miny - mouseY);
            container.minx = mouseX;
            container.miny = mouseY;
        } else if (container.dragTR){
            container.w = Math.abs(container.minx - mouseX);
            container.h += container.miny - mouseY;
            container.miny = mouseY;
        } else if (container.dragBL){
            container.w += container.minx - mouseX;
            container.h = Math.abs(container.miny - mouseY);
            container.minx = mouseX;
        } else if (container.dragBR){
            container.w = Math.abs(container.minx - mouseX);
            container.h = Math.abs(container.miny - mouseY);   
        }
    }
    
    function checkClose(p1, p2){
        return Math.abs(p1 - p2)<100; //10 being close enough
    }

    function print_container(){
        for (i = 0; i < circle_arr.length; i++) {
            document.write(circle_arr[i]);
        }
        return 1;
    }

    //calculates whether the circles are moving closer together
    function isCloser(cir1, cir2){
        var dist = Math.sqrt(Math.pow((cir2.posx - cir1.posx), 2) + Math.pow((cir2.posy - cir1.posy), 2));
        var f1_posx = cir1.posx + cir1.velx;
        var f1_posy = cir1.posy + cir1.vely;
        var f2_posx = cir2.posx + cir2.velx;
        var f2_posy = cir2.posy + cir2.vely;

        var f_dist = Math.sqrt(Math.pow((f2_posx - f1_posx), 2) + Math.pow((f2_posy - f1_posy), 2));

        if (f_dist < dist){
            return true;
        } else {
            return false;
        }
    }
    //checks whether two circles have collided
    function isCollide(cir1, cir2){
        var dist = Math.sqrt(Math.pow((cir2.posx - cir1.posx), 2) + Math.pow((cir2.posy - cir1.posy), 2));
        if (dist <= (cir1.rad + cir2.rad)){
            //alert("reached");
            return true;
        } else{
            return false;
        }
    }    

    //find unit normal vector and tangential vector between two circles
    //return both vector in a col_vec object
    function normalize(cir1, cir2){
        var dist = Math.sqrt(Math.pow((cir2.posx - cir1.posx), 2) + Math.pow((cir2.posy - cir1.posy), 2));
        var col_vec = {
            n_x: (cir2.posx - cir1.posx)/dist,
            n_y: (cir2.posy - cir1.posy)/dist,
            t_x: -((cir2.posy - cir1.posy)/dist),
            t_y: (cir2.posx - cir1.posx)/dist
        };

        return col_vec;
    }

    //calculate velocities of colliding circles in terms of unit norma
    //and tangential vectors.
    //Then find new tangential and normal velocities after collision.
    //Add tangential and normal velocities to find new velocity vector
    function calculate_vec(cir1, cir2){
        var col_vec = normalize(cir1, cir2);

        var col_vel = {
            n_1: cir1.velx * col_vec.n_x + cir1.vely * col_vec.n_y,
            t_1: cir1.velx * col_vec.t_x + cir1.vely * col_vec.t_y,
            n_2: cir2.velx * col_vec.n_x + cir2.vely * col_vec.n_y,
            t_2: cir2.velx * col_vec.t_x + cir2.vely * col_vec.t_y
        }
        
        var tmp_col_veln1 = col_vel.n_1;
        var tmp_col_veln2 = col_vel.n_2;

        //after collision
        col_vel.n_1 = (tmp_col_veln1 * (cir1.mass - cir2.mass) + 2 * cir2.mass * tmp_col_veln2)/(cir1.mass + cir2.mass);
        col_vel.n_2 = (tmp_col_veln2 * (cir2.mass - cir1.mass) + 2 * cir1.mass * tmp_col_veln1)/(cir1.mass + cir2.mass);

        //convert back to vectors
        var vel_vec = {
            n_1:[col_vel.n_1 * col_vec.n_x, col_vel.n_1 * col_vec.n_y],
            t_1:[col_vel.t_1 * col_vec.t_x, col_vel.t_1 * col_vec.t_y],
            n_2:[col_vel.n_2 * col_vec.n_x, col_vel.n_2 * col_vec.n_y],
            t_2:[col_vel.t_2 * col_vec.t_x, col_vel.t_2 * col_vec.t_y]
        }

        cir1.velx = vel_vec.n_1[0] + vel_vec.t_1[0];
        cir1.vely = vel_vec.n_1[1] + vel_vec.t_1[1];
        cir2.velx = vel_vec.n_2[0] + vel_vec.t_2[0];
        cir2.vely = vel_vec.n_2[1] + vel_vec.t_2[1];
        return;
    }

    
    //private function for collision with container
    //If circle is outside of container, it's put back at the edge
    function container_col(cir){
        var col_loc = {
            con_top: false,
            con_bot: false,
            con_left: false,
            con_right: false,
        }
        if (container.minx + cir.rad >= cir.posx){
            cir.posx = container.minx + cir.rad;
            col_loc.con_left = true;
        } else if ((container.minx + container.w) - cir.rad <= cir.posx){
            cir.posx = (container.minx + container.w) - cir.rad;
            col_loc.con_right = true;
        }
        if (container.miny + cir.rad >= cir.posy){
            cir.posy = container.miny + cir.rad;
            col_loc.con_top = true;
        } else if ((container.miny + container.h) - cir.rad <= cir.posy){
            cir.posy = (container.miny + container.h) - cir.rad;
            col_loc.con_bot = true;
        }
        return col_loc;
    }

    //private function to calculate where circle is
    function move_circ(cir){
        
        var con_col = container_col(cir);
        if (con_col.con_top || con_col.con_bot){
            cir.vely = -(cir.vely);
            //alert("touch y");
        }
        if (con_col.con_left || con_col.con_right){
            cir.velx = -(cir.velx);
            //alert("touch x");
        } 

        cir.posx += cir.velx;
        cir.posy += cir.vely;
    }

    //private function to draw a circle
    function draw_circ(cir, ctx){
        ctx.beginPath();
        ctx.fillStyle = cir.colour;
        ctx.arc(cir.posx, cir.posy, cir.rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        return;
    }

    function calc_all_vel(){
        //updates the velocities of circles
        //if and only if the circles are colliding and are getting closer
        //also only if the circles have some velocity in either x or y
        for (var j = 0; j < circle_arr.length-1; j++){
            for (var k = j + 1; k < circle_arr.length; k++){
                if (isCollide(circle_arr[j], circle_arr[k]) && isCloser(circle_arr[j], circle_arr[k])){
                    calculate_vec(circle_arr[j], circle_arr[k]);
                    //alert(String(circle_arr[0].posx) + " " + String(circle_arr[0].posy) + " " + String(circle_arr[1].velx) + " " + String(circle_arr[1].vely));
                }
            }
        }
    }

    function calc_ave_vel(){
        var total_vel = 0;
        for (var i = 0; i < circle_arr.length; i++){
            total_vel += Math.sqrt(Math.pow(circle_arr[i].velx, 2) + Math.pow(circle_arr[i].vely, 2));
        }
        return Math.round(total_vel*100/circle_arr.length)/100;
    }

    function calc_ave_ene(){
        var total_energy = 0;
        for (var i = 0; i < circle_arr.length; i++){
            total_energy += (1/2) * Math.pow(Math.sqrt(Math.pow(circle_arr[i].velx, 2) + Math.pow(circle_arr[i].vely, 2)), 2) * Math.PI * Math.pow(circle_arr[i].rad, 2);
        }
        return Math.round(100*total_energy/circle_arr.length)/100;
    }

    function draw_ave(ctx){
        context.save();
        ctx.fillStyle = "#ffffff";
        ctx.font = "20px Georgia";
        ctx.fillText("Average particle speed: " + String(calc_ave_vel()), 15, 25);
        ctx.fillText("* 30 px/sec", 270, 25);
        ctx.fillText("Average particle energy: " + String(calc_ave_ene()), 15, 45);
        ctx.fillText("* g(30 px/sec)^2", 320, 45);
        context.restore();
        return;
    }

    function draw_frame( context, canvas){
        context.save();
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        calc_all_vel();

        for (var i = 0; i < circle_arr.length; i++){
            move_circ(circle_arr[i]);
            draw_circ(circle_arr[i], context);
        }
        draw_ave(context);
        draw_container(container, context);
        context.restore();
    }

    function setNumCircle( input_number ){
        var curr_num = circle_arr.length;
        var num_circle = input_number;

        if (num_circle > curr_num){
            for (var i = 0; i < num_circle - curr_num; i++){
                init_circle( "testA", canvas ); 
            }
        } else if (num_circle < curr_num) {
            circle_arr.splice( -(curr_num - num_circle), (curr_num - num_circle) );
        }

        return;
    };

    function change_speed( input_num ){
        input_speed = -container.vel + Number(input_num);

        for (var i = 0; i < circle_arr.length; i++){
            var cir = circle_arr[i];
            var old_cir_vel = Math.sqrt(Math.pow(cir.velx, 2) + Math.pow(cir.vely, 2));
            var new_cir_vel = max((old_cir_vel + input_speed), 0);

            //changes the total velocity, and then calculates velx and vely
            if(old_cir_vel != 0){
                cir.velx = cir.velx*new_cir_vel/old_cir_vel;
                cir.vely = cir.vely*new_cir_vel/old_cir_vel;
            } else{
                var ratio = Math.random();
                cir.velx = ratio*Math.sqrt(new_cir_vel);
                if (random_sign() == "neg"){
                    cir.velx = -cir.velx;
                }
                cir.vely = Math.sqrt((1-Math.pow(ratio, 2)))*Math.sqrt(new_cir_vel);
                if(random_sign() == "neg"){
                    cir.vely = -cir.vely;
                }
            }
        }

        container.vel = Number(input_num);
        return;
    }

    function init_circle( name="testA", canvas=canvas ){
        var new_circle = new Circle(name, canvas);
            
        //to prevent from circles being created in the same place
        if (circle_arr.length > 0){
            for (var i = 0; i < circle_arr.length; i++){
                var dist = Math.sqrt(Math.pow(new_circle.posx - circle_arr[i].posx, 2) + Math.pow(new_circle.posy - circle_arr[i].posy, 2));
                if (dist < (circle_arr[i].rad + new_circle.rad)) {
                    new_circle.posx = Math.random()*(canvas.width - new_circle.rad*2) + new_circle.rad;
                    new_circle.posy = Math.random()*(canvas.height - new_circle.rad*2) + new_circle.rad;
                    i = -1;
                }
            }
        }

        circle_arr.push(new_circle);
        return 1;
    };
 
    return {
        init: function( canvas, num_circles ){

            if(canvas.getContext) {
                context = canvas.getContext('2d');
                add_event_listener();
            } else return;

            var timesRan = 0;
            var repeat = setInterval( function() {
                //alert("feels bad");
                draw_frame(context, canvas);
                timesRan += 1;
                if (timesRan > 10000){
                    clearInterval(repeat);
                }
            } , 1000/30);
        },

        changeSpeed: function( input_number ){
            change_speed( input_number );
            return;
        },

        createCircle: function( name="testA", canvas=canvas ){
            init_circle( name, canvas );
            return 1;
        },

        print_c: function(input="hello"){
            print_container();
            return 1;
        },

        get_num_circles: function(){
            return circle_arr.length;
        },

        getMaxVel: function(){
            var max_vel = 0;

            for (var i = 0; i < circle_arr.length; i++){
                var curr_vel = Math.sqrt(Math.pow(circle_arr[i].velx, 2) + Math.pow(circle_arr[i].vely, 2));
                if (curr_vel > max_vel){
                    max_vel = curr_vel;
                }
            }

            return max_vel;
        },

        getCircleArr: function(){
            return circle_arr;
        },

        setCircleNum: function(num_circle){
            setNumCircle(num_circle);
        },
    };
})(controllerModule, canvas);

var controllerModule = (function(containerModule, canvas) {

    function withinBounds(elementId){
        var ele = document.getElementById(elementId);
        if (Number(ele.value) > Number(ele.max)){
            ele.value = ele.max;
            return ele.value;
        } else if (Number(ele.value) < Number(ele.min)){
            ele.value = ele.min;
            return ele.value;
        } else{
            return ele.value;
        }
    };

    return {
        checkBound: function(elementId){
            var val = withinBounds(elementId);
            return val;
        },

        print_val: function(elementId){
            var ele = document.getElementById(elementId);
            return;
        },

        //pie: "pie",
    };
})(containerModule, canvas);

var graphModule = (function(containerModule, canvas) {

    function getVelArr(circle_arr){
        var max_vel = Math.round(containerModule.getMaxVel());
        var graph_arr = Array.apply(null, Array(max_vel + 1)).map(Number.prototype.valueOf, 0);
        for (i = 0; i < max_vel + 1; i++){
            graph_arr.push(0);
        }

        for(var i = 0; i < circle_arr.length; i++){
            var ind = Math.round(Math.sqrt(Math.pow(circle_arr[i].velx, 2) + Math.pow(circle_arr[i].vely, 2)));
            graph_arr[ind] += 1;
        }

        return graph_arr;
    }

    function arrToPoints(graph_arr){
        var svg = document.getElementById('svg');
        var polyline = document.getElementById('graphLine');

        while (polyline.points.length > 0) {
            polyline.points.clear();
        }

        for(var i = 0; i < graph_arr.length; i++){
            if (graph_arr[i] == 0){
                continue;
            }

            var point = svg.createSVGPoint();
            point.x = 15*i + 100;
            point.y = 90 - 2*graph_arr[i];

            polyline.points.appendItem(point);
        }
    }

    return {
        initGraph: function(){
            var repeat = setInterval( function() {
                var vel_arr = getVelArr(containerModule.getCircleArr());
                arrToPoints(vel_arr);
                //reached
            } , 1000/30);
        },
    };
})(containerModule, canvas);

window.onload = function(){
    var num_circles = 200;

    for (var i = 0; i < num_circles; i++){
        containerModule.createCircle("hi", canvas = canvas);
    }

    containerModule.init(canvas, num_circles);

    graphModule.initGraph();
};

//containerModule.print_c();
