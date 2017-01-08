//import { createC } from '.\helper\lib_create.js';

//Bugs:
//calc_collision velocity doesn't work if one of the velocity is 0
//
//Issues:
//Submitting form refreshes page.... why??
//
//ToDo:
//**DONE: Condense the create circle code - it's used twice:
//When click inputbox, remove all things in it.
//Input energy for different states
//Change ball colour when enough energy (speed)
//somehow get a graph of the ball colours?? (prob need google)
//input slider for added energy of system
//Separate collision math into own Module: collision module //for the phyics
//Create module for analysis of balls (energy, bonds, etc): analysisModule -> for the analysis
//



var canvas = document.getElementById("backgroundCanvas");
canvas.width = 500;
canvas.height = 500;

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
        minx: 0,
        miny: 0, 
        maxx: canvas.width,
        maxy: canvas.height,
        vel: 0,
    };
    
    //private constructor to create Circle
    function Circle(name, canvas) {
        this.name = name;
        this.ctx = canvas.getContext('2d');
        this.colour = "rgb(255, 77, 77)";
        this.rad = 10;//Math.random()*10 + 10;
        this.posx = Math.random()*(canvas.width - this.rad*2) + this.rad;
        this.posy = Math.random()*(canvas.height - this.rad*2) + this.rad;
        this.velx = Math.random()*20 - 10;
        this.vely = Math.random()*20 - 10;
        this.mass = Math.pow(this.rad, 2);
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
        } else if (container.maxx - cir.rad <= cir.posx){
            cir.posx = container.maxx - cir.rad;
            col_loc.con_right = true;
        }
        if (container.miny + cir.rad >= cir.posy){
            cir.posy = container.miny + cir.rad;
            col_loc.con_top = true;
        } else if (container.maxy - cir.rad <= cir.posy){
            cir.posy = container.maxy - cir.rad;
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
    function draw_circ(cir){
        cir.ctx.beginPath();
        cir.ctx.fillStyle = cir.colour;
        cir.ctx.arc(cir.posx, cir.posy, cir.rad, 0, Math.PI * 2);
        cir.ctx.fill();
        cir.ctx.closePath();
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

    function draw_frame( context, canvas){
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);

        calc_all_vel();

        for (var i = 0; i < circle_arr.length; i++){
            draw_circ(circle_arr[i]);
            move_circ(circle_arr[i]);
        }
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

            if(canvas.getContext)
                context = canvas.getContext('2d');
            else return;

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

/*
 *Tries to allow enter key to activate setCircleNum. Does not work rn
 *
    var render_btn = document.getElementById("amountSlider");
    render_btn.addEventListener("keydown", function (e) {
        if (e.keyCode === 13) {
            alert("hi");
            containerModule.setCircleNum( document.getElementById("amountText").value );
        }
    });
*/
    var num_circles = 200;

    for (var i = 0; i < num_circles; i++){
        containerModule.createCircle("hi", canvas = canvas);
    }

    containerModule.init(canvas, num_circles);

    graphModule.initGraph();
};

//containerModule.print_c();
