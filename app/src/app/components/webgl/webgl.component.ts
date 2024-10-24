import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { WebGlObject, WebGlService } from './webgl.service';

@Component({
  selector: 'app-webgl',
  templateUrl: './webgl.component.html',
  styleUrl: './webgl.component.scss',
  standalone: true,
  providers: [WebGlService]
})
export class WebglComponent implements AfterViewInit {
  @ViewChild('webglCanvas') webglCanvas: ElementRef;
  @ViewChild('webglCanvasContainer') webglCanvasContainer: ElementRef;
  canvas: HTMLCanvasElement;
  
  constructor(
    private webglService: WebGlService
  ){

  }

  ngAfterViewInit(): void {
      this.canvas = this.webglCanvas.nativeElement as HTMLCanvasElement;
      this.canvas.width = this.webglCanvasContainer.nativeElement.clientWidth;
      this.canvas.height = this.webglCanvasContainer.nativeElement.clientHeight;
      this.testGL();
      // this.testGl();
  }


  testGL() {
    this.webglService.enableDebugMode();
    this.webglService.setupCanvas(this.canvas, {
      backgroundColorGreen: 1.0,
    });

    // Create a triangle
    const triangleColor = new Float32Array([0.0, 0.0, 1.0, 1.0]);
    let triangle:WebGlObject = new WebGlObject(this.canvas.getContext('webgl2').TRIANGLES, {debug: true});
    
    triangle.addPoint(
      new Float32Array([0.4, 0.5]), // Top
      triangleColor
    );

    triangle.addPoint(
      new Float32Array([0.2, 0.0]), // Bottom left
      triangleColor
    );

    triangle.addPoint(
      new Float32Array([0.6, 0.0]), // Bottom right
      triangleColor
    );
    this.webglService.addObject(triangle);

    // Create a square

    const squareColor = new Float32Array([1.0, 0.0, 0.0, 1.0]);
    let square:WebGlObject = new WebGlObject(this.canvas.getContext('webgl2').TRIANGLES, {debug: true});

    const topLeft = new Float32Array([-0.6, 0.6]);
    const topRight = new Float32Array([-0.2, 0.6]);
    const bottomLeft = new Float32Array([-0.6, 0.2]);
    const bottomRight = new Float32Array([-0.2, 0.2]);

    // Connect left triangle
    square.addPoint(topLeft, squareColor);
    square.addPoint(bottomLeft, squareColor);
    square.addPoint(topRight, squareColor);

    // Connect right triangle
    square.addPoint(bottomLeft, squareColor);
    square.addPoint(bottomRight, squareColor);
    square.addPoint(topRight, squareColor);

    this.webglService.addObject(square);
    
    // Render objects
    this.webglService.renderObject(0);
    // this.webglService.renderObject(1);
    // this.webglService.renderAll();
  }

  // Webgl test
  testGl() {
    let gl = this.canvas.getContext('webgl2');
    console.log(gl);
    if(!gl) {
      console.error('WebGL not supported, falling back on experimental-webgl');
      return;
    }
    
    // ----------------- Clear Buffers -----------------

    // Clear color buffer
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set color to black
    gl.clear(gl.COLOR_BUFFER_BIT); //Clear everything - Stores color info of each pixel
    // Clear depth buffer
    gl.clear(gl.DEPTH_BUFFER_BIT); // Clear everything - Store depth info of each pixel
    gl.viewport(0, 0, this.canvas.width, this.canvas.height); // Set the viewport to the size of the canvas

    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear both color and depth buffer (Shortcut)

    // Stencil buffer - Used to mask certain parts of the screen



    // ----------------- Configuration for triangle -----------------

    const triangleVertices = [
      0.0, 1, // Top
      -1, -1, // Bottom Left
      1, -1 // Bottom Right
    ];

    // JS uses 64 bit floating point numbers, WebGL uses 32 bit floating point numbers. So, we need to convert the JS array to a Float32Array
    const triangleVerticesCpuBuffer = new Float32Array(triangleVertices);

    // Create a buffer in the GPU
    const triangleGpuBuffer = gl.createBuffer();
    if(!triangleGpuBuffer) {
      console.error('Failed to create buffer');
      return;
    }

    // Bind the buffer to the ARRAY_BUFFER target
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleGpuBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangleVerticesCpuBuffer, gl.STATIC_DRAW); // STATIC_DRAW - Data will not change

    let vertexShaderSource = `#version 300 es
    precision mediump float; // Set precision of float
    in vec2 vertexPosition; // Input from the vertex buffer

    uniform vec2 canvasSize;
    uniform float shapeSize;
    uniform vec2 shapeLocation;
    void main() {
      // third parameter is 'z' or depth axis, fourth is w axis that divides the other three
      vec2 finalVertexPosition = vertexPosition * shapeSize + shapeLocation;
      vec2 clipSpace = finalVertexPosition / canvasSize * 2.0 - 1.0;
      gl_Position = vec4(clipSpace, 0.0, 1.0); // Set the position of the vertex
    }
    `;

    // Create a vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if(!vertexShader) {
      console.error('Failed to create vertex shader');
      return;
    }
    gl.shaderSource(vertexShader, vertexShaderSource); // Add source code to the shader
    gl.compileShader(vertexShader); // Compile the shader
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('Failed to compile vertex shader');
      return;
    }

    // Create a fragment shader
    let fragmentShaderSource = `#version 300 es
    precision mediump float; // Set precision of float
    out vec4 outputColor; // Output color
    void main() {
      outputColor = vec4(0.0, 1.0, 0.0, 1.0); // Set the color of the fragment
    }
    `;
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if(!fragmentShader) {
      console.error('Failed to create fragment shader');
      return;
    }
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Failed to compile fragment shader');
      return;
    }

    // Create a program
    const triangShaderProgram = gl.createProgram();
    if(!triangShaderProgram) {
      console.error('Failed to create shader program');
      return;
    }
    gl.attachShader(triangShaderProgram, vertexShader); // Attach the vertex shader
    gl.attachShader(triangShaderProgram, fragmentShader); // Attach the fragment shader
    gl.linkProgram(triangShaderProgram); // Link the program
    if(!gl.getProgramParameter(triangShaderProgram, gl.LINK_STATUS)) {
      console.error('Failed to link shader program');
      return;
    }

    // Get the location of the input variable in the vertex shader program to pass the location data
    const vertexPositionAttribLocation = gl.getAttribLocation(triangShaderProgram, 'vertexPosition');
    if(vertexPositionAttribLocation === -1) {
      console.error('Failed to get attribute location');
      return;
    }

    // ----------------- Render the triangle -----------------

    // 2. Vertex Shader - Process each vertex
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleGpuBuffer); // Bind the buffer to the ARRAY_BUFFER target
    gl.vertexAttribPointer(
      vertexPositionAttribLocation, // Index: Which attribute to use
      2, // Number of components per attribute
      gl.FLOAT, // Data type store in the GPU buffer
      false, // Normalized: determines if the data should be normalized between -1 and 1
      2 * Float32Array.BYTES_PER_ELEMENT, // Stride: Offset from the beginning of one vertex to the next
      0 // Offset from the beginning of a single vertex to this attribute      
    );

    // 2. Vretex Shader - Process each vertex
    gl.enableVertexAttribArray(vertexPositionAttribLocation); // Enable the attribute

    // 3. Rasterization - Convert the vertices into fragments
    gl.useProgram(triangShaderProgram); // Use the shader program

    // Update canvas shape, object size and location
    const canvasSizeLocation = gl.getUniformLocation(triangShaderProgram, 'canvasSize');
    gl.uniform2f(canvasSizeLocation, this.canvas.width, this.canvas.height);

    const shapeSizeLocation = gl.getUniformLocation(triangShaderProgram, 'shapeSize');
    gl.uniform1f(shapeSizeLocation, 200);

    const shapeLocationLocation = gl.getUniformLocation(triangShaderProgram, 'shapeLocation');
    gl.uniform2f(shapeLocationLocation, this.canvas.width/2, this.canvas.height/2);
    

    const firstVertexIndex = 0;
    const vertexCount = 3;
    gl.drawArrays(gl.TRIANGLES, firstVertexIndex, vertexCount); // Draw the triangle

  }

}
