            
            var blue = "#2391F1"; // blue
            var lila = "#EA23F1"; // lila 
            var yellow = "#F1EA23"; // yellow
            var turqoise = "#23F1EA"; // turqoise
            var orange = "#F18323"; // orange        
            
            var paper;
            var path;

            var values = [];
            var labels = [];

            var xArr = [];
            var yArr = [];
            var dotVectorAngles = [];
            var dots = [];
            var rad = Math.PI / 180;
            // center
            var x0 = 350;
            var y0 = 350;
            var radius = 200;
            
            var dotSize = 8;
            

            function updatePath(x, y, i){
                xArr[i] = x;
                yArr[i] = y;
                reportScore();
                return getPath();
                
            }
            
            function getPath(){
                return getCurvedPath();
            }
            
            function getClearPath() {
                var pathPlan = "M ";
                for(var i=0;i<xArr.length;i++){
                    pathPlan = pathPlan + xArr[i]+" "+yArr[i]+" L ";
                }
                pathPlan = pathPlan + xArr[0]+" "+yArr[0] + " Z";
                return pathPlan; 
            }
            
            function getCurvedPath() {
                var pathPlan = "M "+xArr[xArr.length-1]+" "+yArr[xArr.length-1];
                var transitionParams = "A "+radius+" "+radius+" 0 0 0 ";
                for(var i=xArr.length-2;i>=0;i--){
                    pathPlan += transitionParams + xArr[i]+" "+yArr[i]+"  ";
                }
                pathPlan += transitionParams + xArr[xArr.length-1]+" "+yArr[xArr.length-1]+" Z";
                
                
                return pathPlan; 
                
            }
            
            function getSurfacePoint(angle){
                return getIndicatorPosition(radius, angle);
            }
            
            function getIndicatorPosition(distance, angle){
                var x = x0 + (distance * Math.cos(angle*rad));
                var y = y0 + (distance * Math.sin(angle*rad));
                
                return {"x":x , "y":y};
                
            }
            
            function getSegmentStartAngle(i){
                return i * (360/labels.length);
            }
            
            function log(msg){
                // console.log(msg)
            }
            
            function drawLineFromCenter(xr, yr){
                var line = paper.path("M "+x0+" "+y0+" L "+xr+" "+yr).attr({stroke: lila});
            }
            
            function distanceFromCenter(x, y){
                var deltaX = x-x0;
                var deltaY = y-y0;
                d = Math.sqrt(( deltaX*deltaX + deltaY*deltaY ));
                return d;
            }
            
            function getScore(){
                var max = radius*xArr.length;
                var sum = 0;
                for(var i=0;i<xArr.length;i++){
                    sum += distanceFromCenter(xArr[i], yArr[i]);
                }
                return Math.ceil(100*sum/max);
            }
            
            function reportScore(){
                document.getElementById("scorecard").innerHTML = "Your happiness level is "+getScore() +"";
            }
            
            function getDot(x, y, i, label){
                var c = paper.circle(x, y, dotSize).attr({ fill: lila, stroke: lila, title:label});
                c.drag( function(dx, dy, x, y, e){
                    distance = distanceFromCenter(x,y);
                    if(distance>radius){
                        distance = radius;
                    }
                    if(distance<0){
                        distance = 0;
                    }
                    log(x+'.'+y);
                    var projection = getIndicatorPosition(distance, dotVectorAngles[i]); 
                    this.attr({"cx":projection.x , "cy":projection.y});
                    path.attr({path: updatePath(projection.x, projection.y, i)});
                });
                
                return c;
            }
            
            function updateDot(i, distance){
                if(distance>radius){
                    distance = radius;
                }
                if(distance<0){
                    distance = 0;
                }
                var projection = getIndicatorPosition(distance, dotVectorAngles[i]); 
                dots[i].attr({"cx":projection.x , "cy":projection.y});
                path.attr({path: updatePath(projection.x, projection.y, i)});
                
            }
            
            $(document).ready(function() {
                
                $("tr").each(function () {
                    values.push(50);
                    labels.push($("th", this).text());
                    var labelIndex = labels.length - 1;
                    $("td .slider", this).slider(
                    {   animate: true , 
                        orientation: 'horizontal' , 
                        value : 50 ,
                        slide : function(event, ui){
                            var value = parseInt($(this).slider("option", "value"), 10);
                            log(value);
                            updateDot(labelIndex, radius*value/100);
                        }
                    });
                });
                
                //---------------------------
                paper = new Raphael(document.getElementById("piecanvas"), 800, 800);
                
                var circle = paper.circle(x0, y0, radius).attr({stroke:blue, gradient: '90-'+'#ffffff'+'-'+blue});
                
                var numOfSegments = labels.length;
                
                // init angles and dot positions
                for(var i=0;i<numOfSegments;i++){
                    var angle = getSegmentStartAngle(i);
                    dotVectorAngles[i] = angle; 
                    var point = getIndicatorPosition(radius/2, angle);
                    xArr[i] = point.x;
                    yArr[i] = point.y;
                }
                
                // outline sectors
                var angleShift = (360/numOfSegments)/2;
                for(var i=0;i<numOfSegments;i++){
                    var angleA = dotVectorAngles[i]-angleShift;
                    var angleB = dotVectorAngles[i]+angleShift;
                    var pointA = getSurfacePoint(angleA);
                    var pointB = getSurfacePoint(angleB);
                    var sectorOutline = paper.path(  ["M",x0,y0,
                        "L",pointB.x,pointB.y,
                        "A",radius, radius, 0,0,0,pointA.x,pointA.y,
                        "L",x0,y0,
                        "z"]
                ).attr({stroke:lila, 'stroke-width':1, gradient: (angle-90)+'-'+blue+'-'+'#ffffff', opacity:0.9, 'stroke-opacity':0.8});
                    sectorOutline.hover( function(){this.animate({stroke:lila, 'stroke-width':5}, 200, 'easeIn');},
                    function(){this.animate({stroke:lila , 'stroke-width':1}, 200, 'easeOut'); });
                }

                // init 'happiness area'
                path = paper.path( getPath() );
                path.attr({gradient: '90-'+yellow+'-'+lila, stroke: lila, 'stroke-width':1, 'stroke-linejoin': 'round', opacity:0.8});
                path.hover(function(){this.animate({opacity:0.9, stroke:lila, 'stroke-width':3}, 200, 'easeIn');},
                function(){this.animate({opacity:0.8, stroke:lila, 'stroke-width':1}, 200, 'easeOut'); });

                           
                // init dots
                for(var i=0;i<numOfSegments;i++){
                    dots[i] = getDot(xArr[i], yArr[i], i, labels[i]); 
                }
                // set labels for sectors
                for(var i=0;i<numOfSegments;i++){
                    var  lPoint = getIndicatorPosition(radius+10,dotVectorAngles[i]);
                    var label = paper.text(lPoint.x, lPoint.y, labels[i]).attr({ fill: '#444', 'font-size':18, 'font-weight': 'bold'});
                    label.rotate((90+dotVectorAngles[i]), lPoint.x, lPoint.y);
                }
                reportScore();
                
            });

