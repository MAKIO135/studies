// THREEJS PHONG FRAGMENT SHADER

#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#define PI 3.14159
#define PI2 6.28318
#define RECIPROCAL_PI2 0.15915494
#define LOG2 1.442695
#define EPSILON 1e-6
#define saturate(a) clamp( a, 0.0, 1.0 )
#define whiteCompliment(a) ( 1.0 - saturate( a ) )

vec3 transformDirection( in vec3 normal, in mat4 matrix ) {
    return normalize( ( matrix * vec4( normal, 0.0 ) ).xyz );
}

// http://en.wikibooks.org/wiki/GLSL_Programming/Applying_Matrix_Transformations
vec3 inverseTransformDirection( in vec3 normal, in mat4 matrix ) {
    return normalize( ( vec4( normal, 0.0 ) * matrix ).xyz );
}

vec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
    float distance = dot( planeNormal, point - pointOnPlane );
    return - distance * planeNormal + point;
}

float sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
    return sign( dot( point - pointOnPlane, planeNormal ) );
}

vec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {
    return lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) ) + pointOnLine;
}

float calcLightAttenuation( float lightDistance, float cutoffDistance, float decayExponent ) {
    if ( decayExponent > 0.0 ) {
        return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );
    }

    return 1.0;
}

vec3 F_Schlick( in vec3 specularColor, in float dotLH ) {
    // Original approximation by Christophe Schlick '94
    //;float fresnel = pow( 1.0 - dotLH, 5.0 );
    // Optimized variant (presented by Epic at SIGGRAPH '13)
    float fresnel = exp2( ( -5.55437 * dotLH - 6.98316 ) * dotLH );
    return ( 1.0 - specularColor ) * fresnel + specularColor;
}

float G_BlinnPhong_Implicit( /* in float dotNL, in float dotNV */ ) {
    // geometry term is (n⋅l)(n⋅v) / 4(n⋅l)(n⋅v)
    return 0.25;
}

float D_BlinnPhong( in float shininess, in float dotNH ) {
    // factor of 1/PI in distribution term omitted
    return ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}

vec3 BRDF_BlinnPhong( in vec3 specularColor, in float shininess, in vec3 normal, in vec3 lightDir, in vec3 viewDir ) {
    vec3 halfDir = normalize( lightDir + viewDir );
    //float dotNL = saturate( dot( normal, lightDir ) );
    //float dotNV = saturate( dot( normal, viewDir ) );
    float dotNH = saturate( dot( normal, halfDir ) );
    float dotLH = saturate( dot( lightDir, halfDir ) );
    vec3 F = F_Schlick( specularColor, dotLH );
    float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );
    float D = D_BlinnPhong( shininess, dotNH );
    return F * G * D;
}

vec3 inputToLinear( in vec3 a ) {
    #ifdef GAMMA_INPUT
        return pow( a, vec3( float( GAMMA_FACTOR ) ) );
    #else
        return a;
    #endif
}

vec3 linearToOutput( in vec3 a ) {
    #ifdef GAMMA_OUTPUT
        return pow( a, vec3( 1.0 / float( GAMMA_FACTOR ) ) );
    #else
        return a;
    #endif
}

#ifdef USE_COLOR
    varying vec3 vColor;
#endif

#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP )
    varying vec2 vUv;
#endif

#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
    varying vec2 vUv2;
#endif

#ifdef USE_MAP
    uniform sampler2D map;
#endif

#ifdef USE_ALPHAMAP
    uniform sampler2D alphaMap;
#endif

#ifdef USE_AOMAP
    uniform sampler2D aoMap;
    uniform float aoMapIntensity;
#endif

#ifdef USE_LIGHTMAP
    uniform sampler2D lightMap;
    uniform float lightMapIntensity;
#endif

#ifdef USE_EMISSIVEMAP
    uniform sampler2D emissiveMap;
#endif

#ifdef USE_ENVMAP
    uniform float reflectivity;
    
    #ifdef ENVMAP_TYPE_CUBE
        uniform samplerCube envMap;
    #else
        uniform sampler2D envMap;
    #endif

    uniform float flipEnvMap;
    
    #if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )
        uniform float refractionRatio;
    #else
        varying vec3 vReflect;
    #endif
#endif

#ifdef USE_FOG
    uniform vec3 fogColor;
    
    #ifdef FOG_EXP2
        uniform float fogDensity;
    #else
        uniform float fogNear;
        uniform float fogFar;
    #endif
#endif

uniform vec3 ambientLightColor;

#if MAX_DIR_LIGHTS > 0
    uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];
    uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];
#endif

#if MAX_HEMI_LIGHTS > 0
    uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];
    uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];
    uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];
#endif

#if MAX_POINT_LIGHTS > 0
    uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];
    uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];
    uniform float pointLightDistance[ MAX_POINT_LIGHTS ];
    uniform float pointLightDecay[ MAX_POINT_LIGHTS ];
#endif

#if MAX_SPOT_LIGHTS > 0
    uniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];
    uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];
    uniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];
    uniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];
    uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];
    uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];
    uniform float spotLightDecay[ MAX_SPOT_LIGHTS ];
#endif

#if MAX_SPOT_LIGHTS > 0 || defined( USE_ENVMAP )
    varying vec3 vWorldPosition;
#endif

varying vec3 vViewPosition;

#ifndef FLAT_SHADED
    varying vec3 vNormal;
#endif

#ifdef USE_SHADOWMAP
    uniform sampler2D shadowMap[ MAX_SHADOWS ];
    uniform vec2 shadowMapSize[ MAX_SHADOWS ];
    uniform float shadowDarkness[ MAX_SHADOWS ];
    uniform float shadowBias[ MAX_SHADOWS ];
    varying vec4 vShadowCoord[ MAX_SHADOWS ];
    float unpackDepth( const in vec4 rgba_depth ) {
        const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
        float depth = dot( rgba_depth, bit_shift );
        return depth;
    }
#endif

#ifdef USE_BUMPMAP
    uniform sampler2D bumpMap;
    uniform float bumpScale;
    // Derivative maps - bump mapping unparametrized surfaces by Morten Mikkelsen
    // http://mmikkelsen3d.blogspot.sk/2011/07/derivative-maps.html
    // Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)
    vec2 dHdxy_fwd() {
        vec2 dSTdx = dFdx( vUv );
        vec2 dSTdy = dFdy( vUv );
        float Hll = bumpScale * texture2D( bumpMap, vUv ).x;
        float dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;
        float dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;
        return vec2( dBx, dBy );
    }

    vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {
        vec3 vSigmaX = dFdx( surf_pos );
        vec3 vSigmaY = dFdy( surf_pos );
        vec3 vN = surf_norm;    // normalized
        vec3 R1 = cross( vSigmaY, vN );
        vec3 R2 = cross( vN, vSigmaX );
        float fDet = dot( vSigmaX, R1 );
        vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
        return normalize( abs( fDet ) * surf_norm - vGrad );
    }
#endif

#ifdef USE_NORMALMAP
    uniform sampler2D normalMap;
    uniform vec2 normalScale;
    // Per-Pixel Tangent Space Normal Mapping
    // http://hacksoflife.blogspot.ch/2009/11/per-pixel-tangent-space-normal-mapping.html
    vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm ) {
        vec3 q0 = dFdx( eye_pos.xyz );
        vec3 q1 = dFdy( eye_pos.xyz );
        vec2 st0 = dFdx( vUv.st );
        vec2 st1 = dFdy( vUv.st );
        vec3 S = normalize( q0 * st1.t - q1 * st0.t );
        vec3 T = normalize( -q0 * st1.s + q1 * st0.s );
        vec3 N = normalize( surf_norm );
        vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
        mapN.xy = normalScale * mapN.xy;
        mat3 tsn = mat3( S, T, N );
        return normalize( tsn * mapN );
    }
#endif

#ifdef USE_SPECULARMAP
    uniform sampler2D specularMap;
#endif

#ifdef USE_LOGDEPTHBUF
    uniform float logDepthBufFC;

    #ifdef USE_LOGDEPTHBUF_EXT
        varying float vFragDepth;
    #endif
#endif

void main() {
    vec3 outgoingLight = vec3( 0.0 );
    vec4 diffuseColor = vec4( diffuse, opacity );
    vec3 totalAmbientLight = ambientLightColor;
    vec3 totalEmissiveLight = emissive;

    #if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)
        gl_FragDepthEXT = log2(vFragDepth) * logDepthBufFC * 0.5;
    #endif

    #ifdef USE_MAP
        vec4 texelColor = texture2D( map, vUv );
        texelColor.xyz = inputToLinear( texelColor.xyz );
        diffuseColor *= texelColor;
    #endif

    #ifdef USE_COLOR
        diffuseColor.rgb *= vColor;
    #endif

    #ifdef USE_ALPHAMAP
        diffuseColor.a *= texture2D( alphaMap, vUv ).g;
    #endif

    #ifdef ALPHATEST
        if ( diffuseColor.a < ALPHATEST ) discard;
    #endif

    float specularStrength;

    #ifdef USE_SPECULARMAP
        vec4 texelSpecular = texture2D( specularMap, vUv );
        specularStrength = texelSpecular.r;
    #else
        specularStrength = 1.0;
    #endif

    #ifdef USE_LIGHTMAP
        totalAmbientLight += texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;
    #endif

    #ifdef USE_AOMAP
        totalAmbientLight *= ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;
    #endif

    #ifdef USE_EMISSIVEMAP
        vec4 emissiveColor = texture2D( emissiveMap, vUv );
        emissiveColor.rgb = inputToLinear( emissiveColor.rgb );
        totalEmissiveLight *= emissiveColor.rgb;
    #endif

    #ifndef FLAT_SHADED
        vec3 normal = normalize( vNormal );
        #ifdef DOUBLE_SIDED
            normal = normal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );
        #endif
    #else
        vec3 fdx = dFdx( vViewPosition );
        vec3 fdy = dFdy( vViewPosition );
        vec3 normal = normalize( cross( fdx, fdy ) );
    #endif

    #ifdef USE_NORMALMAP
        normal = perturbNormal2Arb( -vViewPosition, normal );
    #elif defined( USE_BUMPMAP )
        normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );
    #endif

    vec3 viewDir = normalize( vViewPosition );
    vec3 totalDiffuseLight = vec3( 0.0 );
    vec3 totalSpecularLight = vec3( 0.0 );

    #if MAX_POINT_LIGHTS > 0
        for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {
            vec3 lightColor = pointLightColor[ i ];
            vec3 lightPosition = pointLightPosition[ i ];
            vec3 lVector = lightPosition + vViewPosition.xyz;
            vec3 lightDir = normalize( lVector );
            // attenuation
            float attenuation = calcLightAttenuation( length( lVector ), pointLightDistance[ i ], pointLightDecay[ i ] );
            // diffuse
            float cosineTerm = saturate( dot( normal, lightDir ) );
            totalDiffuseLight += lightColor * attenuation * cosineTerm;
            // specular
            vec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );
            totalSpecularLight += brdf * specularStrength * lightColor * attenuation * cosineTerm;
        }
    #endif

    #if MAX_SPOT_LIGHTS > 0
        for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {
            vec3 lightColor = spotLightColor[ i ];
            vec3 lightPosition = spotLightPosition[ i ];
            vec3 lVector = lightPosition + vViewPosition.xyz;
            vec3 lightDir = normalize( lVector );
            float spotEffect = dot( spotLightDirection[ i ], lightDir );
            if ( spotEffect > spotLightAngleCos[ i ] ) {
                  spotEffect = saturate( pow( saturate( spotEffect ), spotLightExponent[ i ] ) );
                // attenuation
                float attenuation = calcLightAttenuation( length( lVector ), spotLightDistance[ i ], spotLightDecay[ i ] );
                attenuation *= spotEffect;
                // diffuse
                float cosineTerm = saturate( dot( normal, lightDir ) );
                totalDiffuseLight += lightColor * attenuation * cosineTerm;
                // specular
                vec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );
                totalSpecularLight += brdf * specularStrength * lightColor * attenuation * cosineTerm;
            }
        }
    #endif

    #if MAX_DIR_LIGHTS > 0
        for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {
            vec3 lightColor = directionalLightColor[ i ];
            vec3 lightDir = directionalLightDirection[ i ];
            // diffuse
            float cosineTerm = saturate( dot( normal, lightDir ) );
            totalDiffuseLight += lightColor * cosineTerm;
            // specular
            vec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );
            totalSpecularLight += brdf * specularStrength * lightColor * cosineTerm;
        }
    #endif

    #if MAX_HEMI_LIGHTS > 0
        for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {
            vec3 lightDir = hemisphereLightDirection[ i ];
            // diffuse
            float dotProduct = dot( normal, lightDir );
            float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;
            vec3 lightColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );
            totalDiffuseLight += lightColor;
            // specular (sky term only)
            vec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );
            totalSpecularLight += brdf * specularStrength * lightColor * max( dotProduct, 0.0 );
        }
    #endif

    #ifdef METAL
        outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) * specular + totalSpecularLight + totalEmissiveLight;
    #else
        outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) + totalSpecularLight + totalEmissiveLight;
    #endif

    #ifdef USE_ENVMAP
        #if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )
            vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );
            // Transforming Normal Vectors with the Inverse Transformation
            vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
            
            #ifdef ENVMAP_MODE_REFLECTION
                vec3 reflectVec = reflect( cameraToVertex, worldNormal );
            #else
                vec3 reflectVec = refract( cameraToVertex, worldNormal, refractionRatio );
            #endif
        #else
            vec3 reflectVec = vReflect;
        #endif

        #ifdef DOUBLE_SIDED
            float flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 );
        #else
            float flipNormal = 1.0;
        #endif

        #ifdef ENVMAP_TYPE_CUBE
            vec4 envColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
        #elif defined( ENVMAP_TYPE_EQUIREC )
            vec2 sampleUV;
            sampleUV.y = saturate( flipNormal * reflectVec.y * 0.5 + 0.5 );
            sampleUV.x = atan( flipNormal * reflectVec.z, flipNormal * reflectVec.x ) * RECIPROCAL_PI2 + 0.5;
            vec4 envColor = texture2D( envMap, sampleUV );
        #elif defined( ENVMAP_TYPE_SPHERE )
            vec3 reflectView = flipNormal * normalize((viewMatrix * vec4( reflectVec, 0.0 )).xyz + vec3(0.0,0.0,1.0));
            vec4 envColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5 );
        #endif

        envColor.xyz = inputToLinear( envColor.xyz );

        #ifdef ENVMAP_BLENDING_MULTIPLY
            outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
        #elif defined( ENVMAP_BLENDING_MIX )
            outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
        #elif defined( ENVMAP_BLENDING_ADD )
            outgoingLight += envColor.xyz * specularStrength * reflectivity;
        #endif
    #endif

    #ifdef USE_SHADOWMAP
        #ifdef SHADOWMAP_DEBUG
            vec3 frustumColors[3];
            frustumColors[0] = vec3( 1.0, 0.5, 0.0 );
            frustumColors[1] = vec3( 0.0, 1.0, 0.8 );
            frustumColors[2] = vec3( 0.0, 0.5, 1.0 );
        #endif

        float fDepth;
        vec3 shadowColor = vec3( 1.0 );
        for( int i = 0; i < MAX_SHADOWS; i ++ ) {
            vec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w;
            // if ( something && something ) breaks ATI OpenGL shader compiler
            // if ( all( something, something ) ) using this instead
            bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
            bool inFrustum = all( inFrustumVec );
            bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );
            bool frustumTest = all( frustumTestVec );
            if ( frustumTest ) {
                shadowCoord.z += shadowBias[ i ];
                
                #if defined( SHADOWMAP_TYPE_PCF )
                    // Percentage-close filtering
                    // (9 pixel kernel)
                    // http://fabiensanglard.net/shadowmappingPCF/
                    float shadow = 0.0;
                    /*
                        // nested loops breaks shader compiler / validator on some ATI cards when using OpenGL
                        // must enroll loop manually
                        for ( float y = -1.25; y <= 1.25; y += 1.25 )
                            for ( float x = -1.25; x <= 1.25; x += 1.25 ) {
                                vec4 rgbaDepth = texture2D( shadowMap[ i ], vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy );
                                // doesn't seem to produce any noticeable visual difference compared to simple texture2D lookup
                                //vec4 rgbaDepth = texture2DProj( shadowMap[ i ], vec4( vShadowCoord[ i ].w * ( vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy ), 0.05, vShadowCoord[ i ].w ) );
                                float fDepth = unpackDepth( rgbaDepth );
                                if ( fDepth < shadowCoord.z )
                                    shadow += 1.0;
                            }
                        shadow /= 9.0;
                    */

                    const float shadowDelta = 1.0 / 9.0;
                    float xPixelOffset = 1.0 / shadowMapSize[ i ].x;
                    float yPixelOffset = 1.0 / shadowMapSize[ i ].y;
                    float dx0 = -1.25 * xPixelOffset;
                    float dy0 = -1.25 * yPixelOffset;
                    float dx1 = 1.25 * xPixelOffset;
                    float dy1 = 1.25 * yPixelOffset;
                    fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );
                    if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
                    fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );
                    if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
                    fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );
                    if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
                    fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );
                    if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
                    fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );
                    if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
                    fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );
                    if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
                    fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );
                    if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
                    fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );
                    if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
                    fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );
                    if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
                    shadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );
                #elif defined( SHADOWMAP_TYPE_PCF_SOFT )
                    // Percentage-close filtering
                    // (9 pixel kernel)
                    // http://fabiensanglard.net/shadowmappingPCF/
                    float shadow = 0.0;
                    float xPixelOffset = 1.0 / shadowMapSize[ i ].x;
                    float yPixelOffset = 1.0 / shadowMapSize[ i ].y;
                    float dx0 = -1.0 * xPixelOffset;
                    float dy0 = -1.0 * yPixelOffset;
                    float dx1 = 1.0 * xPixelOffset;
                    float dy1 = 1.0 * yPixelOffset;
                    mat3 shadowKernel;
                    mat3 depthKernel;
                    depthKernel[0][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );
                    depthKernel[0][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );
                    depthKernel[0][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );
                    depthKernel[1][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );
                    depthKernel[1][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );
                    depthKernel[1][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );
                    depthKernel[2][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );
                    depthKernel[2][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );
                    depthKernel[2][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );
                    vec3 shadowZ = vec3( shadowCoord.z );
                    shadowKernel[0] = vec3(lessThan(depthKernel[0], shadowZ ));
                    shadowKernel[0] *= vec3(0.25);
                    shadowKernel[1] = vec3(lessThan(depthKernel[1], shadowZ ));
                    shadowKernel[1] *= vec3(0.25);
                    shadowKernel[2] = vec3(lessThan(depthKernel[2], shadowZ ));
                    shadowKernel[2] *= vec3(0.25);
                    vec2 fractionalCoord = 1.0 - fract( shadowCoord.xy * shadowMapSize[i].xy );
                    shadowKernel[0] = mix( shadowKernel[1], shadowKernel[0], fractionalCoord.x );
                    shadowKernel[1] = mix( shadowKernel[2], shadowKernel[1], fractionalCoord.x );
                    vec4 shadowValues;
                    shadowValues.x = mix( shadowKernel[0][1], shadowKernel[0][0], fractionalCoord.y );
                    shadowValues.y = mix( shadowKernel[0][2], shadowKernel[0][1], fractionalCoord.y );
                    shadowValues.z = mix( shadowKernel[1][1], shadowKernel[1][0], fractionalCoord.y );
                    shadowValues.w = mix( shadowKernel[1][2], shadowKernel[1][1], fractionalCoord.y );
                    shadow = dot( shadowValues, vec4( 1.0 ) );
                    shadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );
                #else
                    vec4 rgbaDepth = texture2D( shadowMap[ i ], shadowCoord.xy );
                    float fDepth = unpackDepth( rgbaDepth );
                    if ( fDepth < shadowCoord.z )
                    // spot with multiple shadows is darker
                    shadowColor = shadowColor * vec3( 1.0 - shadowDarkness[ i ] );
                    // spot with multiple shadows has the same color as single shadow spot
                    //          shadowColor = min( shadowColor, vec3( shadowDarkness[ i ] ) );
                #endif
            }

            #ifdef SHADOWMAP_DEBUG
                if ( inFrustum ) outgoingLight *= frustumColors[ i ];
            #endif
        }

        outgoingLight = outgoingLight * shadowColor;
    #endif

    outgoingLight = linearToOutput( outgoingLight );

    #ifdef USE_FOG
        #ifdef USE_LOGDEPTHBUF_EXT
            float depth = gl_FragDepthEXT / gl_FragCoord.w;
        #else
            float depth = gl_FragCoord.z / gl_FragCoord.w;
        #endif

        #ifdef FOG_EXP2
            float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * depth * depth * LOG2 ) );
        #else
            float fogFactor = smoothstep( fogNear, fogFar, depth );
        #endif

        outgoingLight = mix( outgoingLight, fogColor, fogFactor );
    #endif
    
    gl_FragColor = vec4( outgoingLight, diffuseColor.a );
}