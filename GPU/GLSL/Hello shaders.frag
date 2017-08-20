/*
type frag and hit enter for the base fragment shader code.

List of default uniforms included. (No need to add these into your fragment shaders.)
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;
The variants u_resolution, u_mouse and u_time can also be used to match the style found in The Book of Shaders.

You can add textures to your fragment shader by right-clicking on the file in the sidebar:
The uniform name will be the filename minus the extension. For example texture.jpg would be uniform sampler2D texture;

You can remove textures by either right-clicking in the sidebar and selecting Glsl Preview: Remove texture or by clicking the texture square in the preview pane.
*/
#define PI 3.1415926

void main(){
    vec3 color = vec3( 0.0 );
    vec2 st = gl_FragCoord.xy / u_resolution;
    color += step( .5 + cos( st.y * 3. ) * 0.25, st.x );
    gl_FragColor = vec4( color, 1.0);
}
