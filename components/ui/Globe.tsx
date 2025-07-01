import { useEffect, useRef, useState, useMemo } from "react";
import { Color, Scene, Fog, PerspectiveCamera, Vector3 } from "three";
import ThreeGlobe from "three-globe";
import { useThree, Canvas, extend, type ThreeElement } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
// import countries from "@/data/globe.json"; // This local import is likely causing errors in a browser environment

// Extend Three.js types for @react-three/fiber to recognize ThreeGlobe
declare module "@react-three/fiber" {
    interface ThreeElements {
        threeGlobe: ThreeElement<typeof ThreeGlobe>;
    }
}
extend({ ThreeGlobe });

// Constants for globe animation
const RING_PROPAGATION_SPEED = 3;
const aspect = 1.2; // Aspect ratio for the camera
const cameraZ = 300; // Z-position for the camera

// Type definitions for position data and globe configuration
type Position = {
    order: number;
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    arcAlt: number;
    color: string;
};

export type GlobeConfig = {
    pointSize?: number;
    globeColor?: string;
    showAtmosphere?: boolean;
    atmosphereColor?: string;
    atmosphereAltitude?: number;
    emissive?: string;
    emissiveIntensity?: number;
    shininess?: number;
    polygonColor?: string;
    ambientLight?: string;
    directionalLeftLight?: string;
    directionalTopLight?: string;
    pointLight?: string;
    arcTime?: number;
    arcLength?: number;
    rings?: number;
    maxRings?: number;
    initialPosition?: {
        lat: number;
        lng: number;
    };
    autoRotate?: boolean;
    autoRotateSpeed?: number;
};

// Props for the Globe component
interface WorldProps {
    globeConfig: GlobeConfig;
    data: Position[];
}

// Helper function to convert hex color to RGB
export function hexToRgb(hex: string) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    // Ensure hex is a string before calling replace
    const cleanedHex = String(hex).replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanedHex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}


/**
 * Globe component responsible for rendering the 3D globe with arcs and points.
 * It integrates with react-three-fiber and three-globe library.
 */
export function Globe({ globeConfig, data }: WorldProps) {
    // State to hold point data for the globe
    const [globeData, setGlobeData] = useState<
        | {
            size: number;
            order: number;
            color: (t: number) => string;
            lat: number;
            lng: number;
        }[]
        | null
    >(null);

    // Ref to access the ThreeGlobe instance directly
    const globeRef = useRef<ThreeGlobe | null>(null);

    // Default configuration for the globe, merged with user-provided config
    const defaultProps = useMemo(() => ({
        pointSize: 1,
        atmosphereColor: "#ffffff",
        showAtmosphere: true,
        atmosphereAltitude: 0.1,
        polygonColor: "rgba(255,255,255,0.7)",
        globeColor: "#1d072e",
        emissive: "#000000",
        emissiveIntensity: 0.1,
        shininess: 0.9,
        arcTime: 2000,
        arcLength: 0.9,
        rings: 1,
        maxRings: 3,
        ...globeConfig, // Merge with user-provided configurations
    }), [globeConfig]);

    // Effect to build initial globe data and material properties when globeRef is ready
    useEffect(() => {
        if (globeRef.current) {
            _buildMaterial();
            _buildData();
        }
    }, [globeRef.current, defaultProps.globeColor, defaultProps.emissive, defaultProps.emissiveIntensity, defaultProps.shininess, data]); // Added data to dependencies

    // Function to set globe material properties
    const _buildMaterial = () => {
        if (!globeRef.current) return;

        const globeMaterial = globeRef.current.globeMaterial() as unknown as {
            color: Color;
            emissive: Color;
            emissiveIntensity: number;
            shininess: number;
        };
        // Apply colors and intensity from defaultProps, ensuring string inputs
        globeMaterial.color = new Color(String(defaultProps.globeColor));
        globeMaterial.emissive = new Color(String(defaultProps.emissive));
        globeMaterial.emissiveIntensity = defaultProps.emissiveIntensity;
        globeMaterial.shininess = defaultProps.shininess;
    };

    // Function to process raw data into globe points data
    const _buildData = () => {
        const arcs = data; // Use the provided data
        let points = [];

        // Generate points for both start and end of each arc
        for (let i = 0; i < arcs.length; i++) {
            const arc = arcs[i];
            // Ensure arc.color is a string before passing to hexToRgb
            const rgb = hexToRgb(String(arc.color));
            if (rgb) { // Ensure RGB conversion was successful
                points.push({
                    size: defaultProps.pointSize,
                    order: arc.order,
                    color: (t: number) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${1 - t})`,
                    lat: arc.startLat,
                    lng: arc.startLng,
                });
                points.push({
                    size: defaultProps.pointSize,
                    order: arc.order,
                    color: (t: number) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${1 - t})`,
                    lat: arc.endLat,
                    lng: arc.endLng,
                });
            }
        }

        // Filter out duplicate points based on lat/lng to avoid redundant rendering
        const filteredPoints = points.filter(
            (v, i, a) =>
                a.findIndex((v2) =>
                    ["lat", "lng"].every(
                        (k) => v2[k as "lat" | "lng"] === v[k as "lat" | "lng"]
                    )
                ) === i
        );

        setGlobeData(filteredPoints); // Update the state with processed points
    };

    // Effect to update globe data properties once globeData is ready
    useEffect(() => {
        if (globeRef.current && globeData) {
            // Set up globe polygon properties (country borders, removed for now as local data is unavailable)
            // If you have a public URL for a GeoJSON file, you can fetch it and enable this:
            // fetch('YOUR_PUBLIC_GEOJSON_URL')
            //     .then(res => res.json())
            //     .then(countriesData => {
            //         globeRef.current
            //             .hexPolygonsData(countriesData.features)
            //             .hexPolygonResolution(3)
            //             .hexPolygonMargin(0.7)
            //             .hexPolygonColor(() => defaultProps.polygonColor);
            //     }).catch(error => console.error("Error loading country data:", error));


            // Set atmosphere properties
            globeRef.current
                .showAtmosphere(defaultProps.showAtmosphere)
                .atmosphereColor(String(defaultProps.atmosphereColor)) // Ensure string
                .atmosphereAltitude(defaultProps.atmosphereAltitude);

            startAnimation(); // Start the arc and ring animations
        }
    }, [globeData, defaultProps]);

    // Function to configure and start arc and ring animations
    const startAnimation = () => {
        if (!globeRef.current || !globeData) return;

        // Configure arcs
        globeRef.current
            .arcsData(data) // Use the original data for arcs
            .arcStartLat((d) => (d as Position).startLat)
            .arcStartLng((d) => (d as Position).startLng)
            .arcEndLat((d) => (d as Position).endLat)
            .arcEndLng((d) => (d as Position).endLng) // Corrected: ensure it's endLng
            .arcColor((e: any) => String((e as Position).color)) // Ensure color is string
            .arcAltitude((e) => (e as Position).arcAlt)
            .arcStroke((e) => {
                // Random stroke thickness for visual variety
                return [0.32, 0.28, 0.3][Math.round(Math.random() * 2)];
            })
            .arcDashLength(defaultProps.arcLength)
            .arcDashInitialGap((e) => (e as Position).order * 1)
            .arcDashGap(15)
            .arcDashAnimateTime((e) => defaultProps.arcTime);

        // Configure points
        globeRef.current
            .pointsData(globeData) // Use the processed points data
            .ringColor((e: any) => e.color)
            .pointsMerge(true) // Merge points for performance
            .pointAltitude(0.0)
            .pointRadius(2);

        // Configure rings
        globeRef.current
            .ringsData([])
            .ringColor((e: any) => e.color)
            .ringMaxRadius(defaultProps.maxRings)
            .ringPropagationSpeed(RING_PROPAGATION_SPEED)
            .ringRepeatPeriod(
                (defaultProps.arcTime * defaultProps.arcLength) / defaultProps.rings
            );
    };

    // Effect to update rings data periodically
    useEffect(() => {
        let numbersOfRings: number[] = [];
        // Ensure initial data is available before setting up interval
        if (!globeRef.current || !globeData || data.length === 0) {
            return;
        }

        const interval = setInterval(() => {
            // Re-check inside interval, as component might unmount or data change
            if (!globeRef.current || !globeData || data.length === 0) return;

            // Generate random indices for rings
            numbersOfRings = genRandomNumbers(
                0,
                data.length, // Max range based on actual data length
                Math.floor((data.length * 4) / 5) // Number of rings to show (e.g., 80% of data points)
            );

            // Update rings data on the globe
            globeRef.current.ringsData(
                globeData.filter((d, i) => numbersOfRings.includes(i))
            );
        }, 2000); // Interval for ring animation

        // Cleanup function for the interval to prevent memory leaks
        return () => {
            clearInterval(interval);
        };
    }, [globeRef.current, globeData, data]); // Dependencies for this effect

    return (
        // threeGlobe is a custom element registered via extend({ ThreeGlobe })
        <threeGlobe ref={globeRef} />
    );
}

/**
 * WebGLRendererConfig component to set up WebGL renderer properties.
 */
export function WebGLRendererConfig() {
    // Access Three.js renderer and size from the R3F hook
    const { gl, size } = useThree();

    useEffect(() => {
        gl.setPixelRatio(window.devicePixelRatio); // Set pixel ratio for high DPI displays
        gl.setSize(size.width, size.height); // Set renderer size
        // gl.setClearColor(0xffaaff, 0); // Removed as Fog handles background, and it was mostly transparent pink
    }, [gl, size]); // Re-run if gl or size changes

    return null; // This component doesn't render anything visually
}

/**
 * Main World component that sets up the Three.js scene and includes the Globe.
 */
export function World(props: WorldProps) {
    const { globeConfig } = props;

    // Create a new Three.js Scene and add fog for depth perception
    const scene = useMemo(() => {
        const s = new Scene();
        s.fog = new Fog(0xffffff, 400, 2000); // White fog from 400 to 2000 units
        return s;
    }, []);

    // Set up the camera position initially
    const cameraPosition = useMemo(() => new Vector3(0, 0, cameraZ), []);

    return (
        <Canvas
            scene={scene}
            // Set up the camera with initial position
            camera={new PerspectiveCamera(50, aspect, 180, 1800)}
            // style={{ width: '90%', height: '100vh' }} // Ensure canvas fills the screen
            gl={{ preserveDrawingBuffer: true }} // Needed if you plan to capture screenshots
            onCreated={({ camera }) => { // Set camera position after creation
                camera.position.copy(cameraPosition);
            }}
        >
            <WebGLRendererConfig />

            {/* Lights for the scene, with robust default colors */}
            <ambientLight color={globeConfig.ambientLight ?? "#aaaaaa"} intensity={0.6} />
            <directionalLight
                color={globeConfig.directionalLeftLight ?? "#00b1ff"}
                position={new Vector3(-400, 100, 400)}
            />
            <directionalLight
                color={globeConfig.directionalTopLight ?? "#ffffff"}
                position={new Vector3(-200, 500, 200)}
            />
            <pointLight
                color={globeConfig.pointLight ?? "#ffffff"}
                position={new Vector3(-200, 500, 200)}
                intensity={0.8}
            />

            {/* Render the Globe component */}
            <Globe {...props} />

            {/* OrbitControls for camera interaction */}
            <OrbitControls
                enablePan={false} // Disable panning
                enableZoom={false} // Disable zooming
                minDistance={cameraZ} // Minimum zoom distance
                maxDistance={cameraZ} // Maximum zoom distance
                autoRotate={globeConfig.autoRotate ?? true} // Auto-rotate based on config, default true
                autoRotateSpeed={globeConfig.autoRotateSpeed ?? 1} // Auto-rotate speed from config, default 1
                minPolarAngle={Math.PI / 3.5} // Limit vertical rotation
                maxPolarAngle={Math.PI - Math.PI / 3} // Limit vertical rotation
            />
        </Canvas>
    );
}

// Main App component to render the World (globe)
export default function App() {
    // Mock data for globe arcs
    const mockData: Position[] = [
        {
            order: 1,
            startLat: 40.7128,
            startLng: -74.0060,
            endLat: 34.0522,
            endLng: -118.2437,
            arcAlt: 0.5,
            color: "#ff0000"
        },
        {
            order: 2,
            startLat: 51.5074,
            startLng: -0.1278,
            endLat: 35.6895,
            endLng: 139.6917,
            arcAlt: 0.7,
            color: "#00ff00"
        },
        {
            order: 3,
            startLat: -33.8688,
            startLng: 151.2093,
            endLat: 39.9042,
            endLng: 116.4074,
            arcAlt: 0.6,
            color: "#0000ff"
        },
        {
            order: 4,
            startLat: 34.0522,
            startLng: -118.2437,
            endLat: 51.5074,
            endLng: -0.1278,
            arcAlt: 0.5,
            color: "#ffff00"
        },
        {
            order: 5,
            startLat: 30.0444, // Cairo
            startLng: 31.2357,
            endLat: 28.2307, // Luxor
            endLng: 32.3942,
            arcAlt: 0.3,
            color: "#FFA500" // Orange
        },
        {
            order: 6,
            startLat: 31.0461, // Alexandria
            startLng: 29.9553,
            endLat: 29.9782, // Aswan
            endLng: 32.8878,
            arcAlt: 0.4,
            color: "#8A2BE2" // BlueViolet
        }
    ];

    // Mock globe configuration
    const mockGlobeConfig: GlobeConfig = {
        pointSize: 1.5,
        globeColor: "#1d072e",
        showAtmosphere: true,
        atmosphereColor: "#ffffff",
        atmosphereAltitude: 0.15,
        emissive: "#000000",
        emissiveIntensity: 0.1,
        shininess: 0.9,
        polygonColor: "rgba(255,255,255,0.7)",
        ambientLight: "#aaaaaa",
        directionalLeftLight: "#00b1ff",
        directionalTopLight: "#ffffff",
        pointLight: "#ffffff",
        arcTime: 1500,
        arcLength: 0.7,
        rings: 2,
        maxRings: 5,
        autoRotate: true,
        autoRotateSpeed: 0.5,
    };

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <World globeConfig={mockGlobeConfig} data={mockData} />
        </div>
    );
}

// Helper function to generate random numbers
export function genRandomNumbers(min: number, max: number, count: number) {
    const arr = [];
    while (arr.length < count) {
        const r = Math.floor(Math.random() * (max - min)) + min;
        if (arr.indexOf(r) === -1) arr.push(r); // Use includes for better readability than indexOf
    }
    return arr;
}
