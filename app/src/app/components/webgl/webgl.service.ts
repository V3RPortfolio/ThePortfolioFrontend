import { Injectable } from "@angular/core";



export class WebGlVertex {

    /**
     * Represents a vertex in a 3D space.
     */

    private x:number=0.0; // value of x coordinate of the vertex (-1 to 1)
    private y:number=0.0; // value of y coordinate of the vertex (-1 to 1)
    private z:number=0.0; // value of z coordinate of the vertex (-1 to 1)
    private w:number=1.0; // value of w coordinate of the vertex (-1 to 1)

    constructor(
        vertices:Float32Array
    ) {
        const isValid = this.setVertex(vertices);
        if(!isValid) {
            throw new Error('Invalid vertex values. It must be within -1 and 1 inclusive. It should contain at least one value and at most 4 values.');
        }

    }

    isValidVertexValue(
        value:number
    ):boolean {
        return value >= -1 && value <= 1
    }

    setVertex(
        vertices:Float32Array
    ):boolean {
        let areValuesValid = false;
        if(!vertices || vertices.length < 1 || vertices.length > 4) areValuesValid;
        areValuesValid = vertices.every((value) => this.isValidVertexValue(value));
        if(!areValuesValid) return false;
        this.x = vertices[0];
        if(vertices.length > 1) this.y = vertices[1];
        if(vertices.length > 2) this.z = vertices[2];
        if(vertices.length > 3) this.w = vertices[3];
        return true;
    }

    getVertex():Float32Array {
        return new Float32Array([this.x, this.y, this.z, this.w]);
    }

}

export class WebGLColor {
    /**
     * Represents a color in a 3D space.
     */
    private red:number=0;
    private green:number=0;
    private blue:number=0;
    private alpha:number=1;

    constructor(
        color:Float32Array
    ) {
       const isValid = this.setColor(color);
        if(!isValid) {
            throw new Error('Invalid color values. It must be between 0 and 1 inclusive. It should contain at least 3 values and at most 4 values.');
        }
    }

    isValidColorValue(
        value:number
    ):boolean {
        return value >= 0 && value <= 1;
    }

    setColor(
        color:Float32Array
    ):boolean {
        if(!color || color.length < 3 || color.length > 4) return false;
        if(!color.every((value) => this.isValidColorValue(value))) return false;
        this.red = color[0];
        this.green = color[1];
        this.blue = color[2];
        if(color.length > 3) this.alpha = color[3];
        return true;
    }

    getColor():Float32Array {
        return new Float32Array([this.red, this.green, this.blue, this.alpha]);
    }
}

export class WebGlPoint {
    /**
     * Represents a point in a 3D space.
     */
    private vertex:WebGlVertex;
    private color:WebGLColor;

    constructor(
        vertex:Float32Array,
        color:Float32Array
    ) {
        this.vertex = new WebGlVertex(vertex);
        this.color = new WebGLColor(color);
    }

    getPosition():Float32Array {
        return this.vertex.getVertex();
    }

    getColor():Float32Array {
        return this.color.getColor();
    }

    private setPosition(vertex:Float32Array):boolean {
        return this.vertex.setVertex(vertex);
    }

    private setColor(color:Float32Array):boolean {
        return this.color.setColor(color);
    }

    resetPosition():boolean {
        return this.vertex.setVertex(new Float32Array([0, 0, 0, 1]));
    }

    resetColor():boolean {
        return this.color.setColor(new Float32Array([0, 0, 0, 1]));
    }

    moveX(distance:number):boolean {
        const position = this.getPosition();
        position[0] += distance;
        if(position[0] < -1 || position[0] > 1) return false;
        return this.setPosition(position);
    }

    setX(x:number):boolean {
        if(x < -1 || x > 1) return false;
        const position = this.getPosition();
        position[0] = x;
        return this.setPosition(position);
    }

    moveY(distance:number):boolean {
        const position = this.getPosition();
        position[1] += distance;
        if(position[1] < -1 || position[1] > 1) return false;
        return this.setPosition(position);
    }

    setY(y:number):boolean {
        if(y < -1 || y > 1) return false;
        const position = this.getPosition();
        position[1] = y;
        return this.setPosition(position);
    }

    moveZ(distance:number):boolean {
        const position = this.getPosition();
        position[2] += distance;
        if(position[2] < -1 || position[2] > 1) return false;
        return this.setPosition(position);
    }

    setZ(z:number):boolean {
        if(z < -1 || z > 1) return false;
        const position = this.getPosition();
        position[2] = z;
        return this.setPosition(position);
    }

    move({
        x=0,
        y=0,
        z=0
    }: {
        x?:number,
        y?:number,
        z?:number
    }):boolean {
        const position = this.getPosition();
        position[0] += x;
        position[1] += y;
        position[2] += z;

        const isValid = position.every((value) => value >= -1 && value <= 1);
        if(!isValid) return false;
        return this.setPosition(position);
    }

    changeScalingFactor(factor:number):boolean {
        const position = this.getPosition();
        position[3] += factor;
        if(position[3] < -1 || position[3] > 1 || position[3] == 0) return false;
        return this.setPosition(position);
    }
    
    changeColor({
        red=-1,
        green=-1,
        blue=-1,
        alpha=-1
    }: {
        red?:number,
        green?:number,
        blue?:number,
        alpha?:number
    }):boolean {
        const color = this.getColor();
        if(red && red >= 0 && red <= 1) color[0] = red;
        if(green && green >=0 && green <= 1) color[1] = green;
        if(blue && blue >=0 && blue <= 1) color[2] = blue;
        if(alpha && alpha >=0 && alpha <= 1) color[3] = alpha;
        return this.setColor(color);
    }

    dispose() {
        this.vertex = null;
        this.color = null;
    }
}

export class WebGlObject {
    /**
     * Represents a 3D object in a 3D space.
     */
    private points:WebGlPoint[] = [];
    private debugEnabled:boolean;
    constructor(
        private objectType:any,
        {
            debug=false,
        }: {
            debug?:boolean
        }={}
    ) {
        this.points = [];
        this.debugEnabled = debug;
    }

    enableDebugMode() {
        this.debugEnabled = true;
    }

    disableDebugMode() {
        this.debugEnabled = false;
    }

    getObjectType() {
        return this.objectType;
    }

    print(message:any, {isWarning=false, isError=false}: {isWarning?:boolean, isError?:boolean}={}) {
        if(!this.debugEnabled) return;
        if(isWarning) {
            console.warn(message);
        } else if(isError) {
            console.error(message);
        } else {
            console.log(message);
        }
    }

    deleteAllPoints() {
        this.points = [];
    }

    deletePoint(index:number, deallocate:boolean=false):WebGlPoint {
        if(index < 0 || index >= this.points.length) return null;
        const point = this.points[index];
        this.points.splice(index, 1);
        if(deallocate) point.dispose();
        return point;
    }

    addPoint(
        position:Float32Array,
        color:Float32Array,
        {
            index=-1,
            disposeExistingPoint=true
        }:{
            index?:number,
            disposeExistingPoint?:boolean
            
        }={}
    ):boolean {
        try {
            const point = new WebGlPoint(position, color);
            if(!index || index < 0 || index >= this.points.length) {
                this.print('Adding point to the end of the object');
                this.points.push(point);
                return true;
            }
            this.print('Adding point at index ' + index);
            const currentPoint = this.points[index];
            this.points[index] = point;
            if(disposeExistingPoint) currentPoint.dispose();
            return true;
        } catch(e) {
            this.print(e, {isError:true});
        }
        return false;
    }

    getPositionOfPoint(index:number):Float32Array {
        if(index < 0 || index >= this.points.length) return null;
        return this.points[index].getPosition();
    }

    getColorOfPoint(index:number):Float32Array {
        if(index < 0 || index >= this.points.length) return null;
        return this.points[index].getColor();
    }

    totalPoints():number {
        return this.points.length;
    }

    movePoint(index:number, {
        x=null,
        y=null,
        z=null
    }: {
        x?:number,
        y?:number,
        z?:number
    }):boolean {
        if(index < 0 || index >= this.points.length) return false;
        
        let movedX = true;
        let movedY = true;
        let movedZ = true;

        if(x) {
            movedX = this.points[index].moveX(x);
        }

        if(y) {
            movedY = this.points[index].moveY(y);
        }

        if(z) {
            movedZ = this.points[index].moveZ(z);
        }

        return movedX && movedY && movedZ;
    }

    setPointPosition(index:number, {
        x=null,
        y=null,
        z=null
    }: {
        x?:number,
        y?:number,
        z?:number
    }):boolean {
        if(index < 0 || index >= this.points.length) return false;
        let movedX = true;
        let movedY = true;
        let movedZ = true;

        if(x) {
            movedX = this.points[index].setX(x);
        }

        if(y) {
            movedY = this.points[index].setY(y);
        }

        if(z) {
            movedZ = this.points[index].setZ(z);
        }

        return movedX && movedY && movedZ;
    }

    updateColorOfPoint(index:number, {
        red=null,
        green=null,
        blue=null,
        alpha=null
    }: {
        red?:number,
        green?:number,
        blue?:number,
        alpha?:number
    }):boolean {
        if(index < 0 || index >= this.points.length) return false;
        return this.points[index].changeColor({red, green, blue, alpha});
    }

    dispose() {
        this.points.forEach((point) => {
            point.dispose();
        });
        this.points = [];
    }

}

@Injectable({
    providedIn: 'root'
})
export class WebGlService {

    /**
     * This service provides functionalities to work with WebGL.
     */

    private debugEnabled:boolean = false;

    canvas:HTMLCanvasElement;
    private gl:WebGL2RenderingContext;
    private positionBuffer:WebGLBuffer;
    private colorBuffer:WebGLBuffer;
    private vertexShader:WebGLShader;
    private fragmentShader:WebGLShader;
    private program:WebGLProgram;


    private objects:WebGlObject[] = [];

    GLSL_POSITION_VARIABLE_NAME = 'position';
    GLSL_COLOR_VARIABLE_NAME = 'color';
    GLSL_OBJECT_LOCAL_COORDINATE_VARIABLE_NAME = 'shapeLocation';
    GLSL_OBJECT_SIZE_VARIABLE_NAME = 'shapeSize';
    GLSL_CANVAS_SIZE_VARIABLE_NAME = 'canvasSize';

    constructor(){

    }

    enableDebugMode() {
        this.debugEnabled = true;
    }

    disableDebugMode() {
        this.debugEnabled = false;
    }

    print(message:any, {isWarning=false, isError=false}: {isWarning?:boolean, isError?:boolean}={}) {
        if(!this.debugEnabled) return;
        if(isWarning) {
            console.warn(message);
        } else if(isError) {
            console.error(message);
        } else {
            console.log(message);
        }
    }

    private configureShader(
        shader:WebGLShader,
        source:string
    ):boolean {
        console.log(source);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            this.print('Failed to compile shader', {isError:true});
            return false;
        }
        return true;
    }

    private createProgram(
        vertexShader:WebGLShader,
        fragmentShader:WebGLShader
    ): WebGLProgram {
        const program = this.gl.createProgram();
        if(!program) {
            this.print('Failed to create shader program', {isError:true});
            return null;
        }
        if(vertexShader) {
            this.print('Attaching vertex shader');
            this.gl.attachShader(program, vertexShader);
        }
        if(fragmentShader) {
            this.print('Attaching fragment shader');
            this.gl.attachShader(program, fragmentShader);
        }

        return program;
    }

    private getVertexShaderSource(precision:'high'|'medium'='medium'):string {
        const precisionValue = precision == 'high' ? 'highp' : 'mediump';
        return `#version 300 es
            precision ${precisionValue} float; // Set precision of float
            in vec4 ${this.GLSL_POSITION_VARIABLE_NAME}; // Set the position of the vertex
            in vec4 ${this.GLSL_COLOR_VARIABLE_NAME}; // Set the color of the vertex

            uniform vec4 ${this.GLSL_OBJECT_LOCAL_COORDINATE_VARIABLE_NAME}; // Local coordinate of the object
            uniform float ${this.GLSL_OBJECT_SIZE_VARIABLE_NAME}; // Size of the object
            uniform vec2 ${this.GLSL_CANVAS_SIZE_VARIABLE_NAME}; // Size of the canvas

            out vec4 vColor; // Output color
            void main() {
                vec4 canvas = vec4(${this.GLSL_CANVAS_SIZE_VARIABLE_NAME}, 0, 0); // Set the canvas size
                vec4 finalVertexLocalPosition = ${this.GLSL_POSITION_VARIABLE_NAME} * ${this.GLSL_OBJECT_SIZE_VARIABLE_NAME} + ${this.GLSL_OBJECT_LOCAL_COORDINATE_VARIABLE_NAME}; // Compute the final position of the vertex
                vec4 finalVertexClipLocation = finalVertexLocalPosition * 2.0 / canvas - 1.0; // Compute the final position of the vertex in clip space
                
                
                gl_Position = finalVertexClipLocation; // Set the position of the vertex

                vColor = ${this.GLSL_COLOR_VARIABLE_NAME}; // Set the color of the vertex
            }
        `;
    }

    private getFragmentShaderSource(precision:'high'|'medium'='high'):string {
        const precisionValue = precision == 'high' ? 'highp' : 'mediump';
        return `#version 300 es
            precision ${precisionValue} float; // Set precision of float
            in vec4 vColor; // Input color
            out vec4 outputColor; // Output color
            void main() {
                outputColor = vColor; // Set the color of the fragment
            }
        `;
    }

    setupCanvas(
        canvas:HTMLCanvasElement,
        {
            backgroundColorRed=0,
            backgroundColorGreen=0,
            backgroundColorBlue=0,
        }:{
            backgroundColorRed?:number,
            backgroundColorGreen?:number,
            backgroundColorBlue?:number
        }={}
    ):boolean {
        if(!canvas) {
            return false;
        }

        // Create canvas and context
        this.canvas = canvas;
        this.gl = this.canvas.getContext('webgl2');

        if(backgroundColorRed < 0 && backgroundColorRed > 1) backgroundColorRed = 0;
        if(backgroundColorGreen < 0 && backgroundColorGreen > 1) backgroundColorGreen = 0;
        if(backgroundColorBlue < 0 && backgroundColorBlue > 1) backgroundColorBlue = 0;

        this.gl.clearColor(backgroundColorRed, backgroundColorGreen, backgroundColorBlue, 1.0); // Set background color of canvas
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // or condition means clear both color and depth buffer

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height); // Set the viewport to the size of the canvas

        // Configure buffers
        this.positionBuffer = this.gl.createBuffer();
        if(!this.positionBuffer) {
            this.print('Failed to create buffer', {isError:true});
            return false;
        }
        this.colorBuffer = this.gl.createBuffer();
        if(!this.colorBuffer) {
            this.print('Failed to create buffer', {isError:true});
            return false;
        }

        let compiledShader = true;
        // Configure Vertex shader
        this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        compiledShader = this.configureShader(this.vertexShader, this.getVertexShaderSource());
        if(!compiledShader) return false;


        // Configure Fragment shader
        this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        compiledShader = this.configureShader(this.fragmentShader, this.getFragmentShaderSource());
        if(!compiledShader) return false;

        // Create program

        this.program = this.createProgram(this.vertexShader, this.fragmentShader);
        this.gl.linkProgram(this.program);
        if(!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            this.print(this.gl.getProgramInfoLog(this.program));
            this.print('Failed to link program', {isError:true});
            return false;
        } else {
            this.print('Program linked successfully');
        }


        return true;
    }

    addObject(
        object:WebGlObject,
        {
            index=-1,
            disposeExistingObject=true
        }: {
            index?:number,
            disposeExistingObject?:boolean
        }={}
    ):boolean {
        if(!object) return false;
        if(!index || index < 0 || index > this.objects.length) this.objects.push(object);
        else {
            const currentObject = this.objects[index];
            this.objects[index] = object;
            if(disposeExistingObject) currentObject.dispose();
        }
        return true;
    }

    removeObject(index:number, deallocate:boolean=false):WebGlObject {
        if(index < 0 || index >= this.objects.length) return null;
        const object = this.objects[index];
        this.objects.splice(index, 1);
        if(deallocate) object.dispose();
        return object;
    }

    deleteAllObjects(dispose:boolean=false) {
        if(dispose) {
            this.objects.forEach((object) => {
                object.dispose();
            });
        }
        this.objects = [];
    }

    private renderFromBuffer(
        buffer:WebGLBuffer,
        data:Float32Array,
        program:WebGLProgram,
        attributeName:string,
        objectType:any,
        {
            vertexStartIndex=0,
            vertexCount=4,
            numberOfValuesPerVertex=4,
        }:{
            vertexStartIndex?:number,
            vertexCount?:number,
            numberOfValuesPerVertex?:number
        }={}
    ): boolean {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer); // Bind the buffer to the ARRAY_BUFFER target
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW); // Add data to the buffer
        this.print('Buffer data added');

        const attribute = this.gl.getAttribLocation(program, attributeName); // Get index of the variable in GLSL
        this.print('Attribute: ' + attribute);

        if(attribute < 0) {
            this.print(`Failed to get attribute ${attributeName}`, {isError:true});
            return false;
        }

        // Point GLSL to read values from the variable
        this.gl.vertexAttribPointer(
            attribute, // Variable reference
            numberOfValuesPerVertex, // Number of values per vertex
            this.gl.FLOAT,  // Data type
            false, // Normalize
            numberOfValuesPerVertex * Float32Array.BYTES_PER_ELEMENT, // Size of individual vertex
            vertexStartIndex // Offset from the beginning of the vertex to this attribute
        );

        // Enable the attribute
        this.gl.enableVertexAttribArray(attribute);

        // Draw the object
        this.gl.drawArrays(objectType, vertexStartIndex, vertexCount); // Draw the object

        return true;
    }

    renderObject(index:number):boolean {
        this.print('Rendering object at index ' + index);
        if(index < 0 || index >= this.objects.length) return false;
        const object = this.objects[index];
        if(!object) return false;
        this.print('Rendering object with ' + object.totalPoints() + ' points');

        // For each point in the object, render the point
        let positions:number[] = [];
        let colors:number[] = [];

        // Get position and color of all points/vertices of the object
        for(let i=0; i<object.totalPoints(); i++) {
            const point = object.getPositionOfPoint(i);
            if(point) {
                positions.push(...point);
            }
            const color = object.getColorOfPoint(i);
            if(color) {
                colors.push(...color);
            }
        }

        // Configure the program
        this.gl.useProgram(this.program); // Use the shader program
        let vertexStartIndex = 0; // Start of the index of buffer
        let vertexCount = object.totalPoints(); // Total number of vertices

        // Set the object local coordinate, size, and canvas size
        this.print('Setting object local coordinate, size, and canvas size ' + 
            this.GLSL_CANVAS_SIZE_VARIABLE_NAME + ' ' + 
            this.GLSL_OBJECT_LOCAL_COORDINATE_VARIABLE_NAME + ' ' + 
            this.GLSL_OBJECT_SIZE_VARIABLE_NAME
        );
        const vertexLocalPosition = this.gl.getUniformLocation(this.program, this.GLSL_OBJECT_LOCAL_COORDINATE_VARIABLE_NAME);
        const vertexSize = this.gl.getUniformLocation(this.program, this.GLSL_OBJECT_SIZE_VARIABLE_NAME);
        const canvasSize = this.gl.getUniformLocation(this.program, this.GLSL_CANVAS_SIZE_VARIABLE_NAME);

        if(vertexLocalPosition == null || vertexSize == null || canvasSize == null) {
            this.print('Failed to get uniform variables', {isError:true});
            this.print(this.gl.getProgramInfoLog(this.program));
            return false;
        }

        
        this.gl.uniform4f(vertexLocalPosition, this.canvas.width/2, this.canvas.height/2, 0, 0); // Set the object local coordinate
        this.gl.uniform1f(vertexSize, 200 ); // Set the object size
        this.gl.uniform2f(canvasSize, this.canvas.width, this.canvas.height); // Set the canvas size

        // Render position buffer
        this.renderFromBuffer(
            this.positionBuffer, 
            new Float32Array(positions), 
            this.program, 
            this.GLSL_POSITION_VARIABLE_NAME, 
            object.getObjectType(), 
            {
                vertexStartIndex, 
                vertexCount,
                numberOfValuesPerVertex: 4,                
            }
        );

        // Render color buffer
        this.renderFromBuffer(
            this.colorBuffer, 
            new Float32Array(colors), 
            this.program, 
            this.GLSL_COLOR_VARIABLE_NAME, 
            object.getObjectType(), 
            {
                vertexStartIndex, 
                vertexCount,
                numberOfValuesPerVertex: 4,                
            }
        );
        

        return true;
    }

    renderAll() {       
        let vertexArrayObjects: WebGLVertexArrayObject[] = []
        this.gl.useProgram(this.program); // Use the shader program
        for(let object of this.objects) {
            // Create a vertex array to add multiple bindings
            const vertexArray = this.gl.createVertexArray();
            this.gl.bindVertexArray(vertexArray);

            // Compute the color and position of each object
            // For each point in the object, render the point
            let positions:number[] = [];
            let colors:number[] = [];

            // Get position and color of all points/vertices of the object
            for(let i=0; i<object.totalPoints(); i++) {
                const point = object.getPositionOfPoint(i);
                if(point) {
                    positions.push(...point);
                }
                const color = object.getColorOfPoint(i);
                if(color) {
                    colors.push(...color);
                }
            }

            // Bind position data
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer); // Bind the buffer to the ARRAY_BUFFER target
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW); // Add data to the buffer
            this.gl.vertexAttribPointer(
                this.gl.getAttribLocation(this.program, this.GLSL_POSITION_VARIABLE_NAME), // Index: Which attribute to use
                4, // Number of components per attribute
                this.gl.FLOAT, // Data type store in the GPU buffer
                false, // Normalized: determines if the data should be normalized between -1 and 1
                4, // Stride: Offset from the beginning of one vertex to the next
                0 // Offset from the beginning of a single vertex to this attribute      
            )

            // Bind color data
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer); // Bind the buffer to the ARRAY_BUFFER target
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW); // Add data to the buffer
            this.gl.vertexAttribPointer(
                this.gl.getAttribLocation(this.program, this.GLSL_COLOR_VARIABLE_NAME), // Index: Which attribute to use
                4, // Number of components per attribute
                this.gl.FLOAT, // Data type store in the GPU buffer
                false, // Normalized: determines if the data should be normalized between -1 and 1
                4, // Stride: Offset from the beginning of one vertex to the next
                0 // Offset from the beginning of a single vertex to this attribute      
            )

            vertexArrayObjects.push(vertexArray);

        }

        for(let i=0; i < this.objects.length; i++) {
            this.gl.bindVertexArray(vertexArrayObjects[i]);
            const positionAttribute = this.gl.getAttribLocation(this.program, this.GLSL_POSITION_VARIABLE_NAME);
            this.gl.enableVertexAttribArray(positionAttribute);
            this.gl.drawArrays(this.objects[i].getObjectType(), 0, this.objects[i].totalPoints());

            const colorAttribute = this.gl.getAttribLocation(this.program, this.GLSL_COLOR_VARIABLE_NAME);
            this.gl.enableVertexAttribArray(colorAttribute);
            this.gl.drawArrays(this.objects[i].getObjectType(), 0, this.objects[i].totalPoints());
        }
    }

}