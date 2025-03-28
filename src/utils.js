import tinycolor from 'tinycolor2';
import { gql, useLazyQuery } from "@apollo/client";
import chroma from "chroma-js";

export const generatePieColors = (paletteName, numSlices, COLOR_PALETTES) => {
    if (paletteName && COLOR_PALETTES[paletteName]) {
        return chroma.scale(COLOR_PALETTES[paletteName]).colors(numSlices);
    }
    // Fallback: Generate a default set of distinct colors
    return chroma.scale(["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"]).colors(numSlices);
};

export const generateColor = (index, totalTraces) => {
    const hue = (index / totalTraces) * 360;
    const colorHSL = `hsl(${hue}, 70%, 50%)`; 
    const colorHex = tinycolor(colorHSL).toHexString(); 
    return colorHex; 
  };


export const COLOR_PALETTES = {
    rainbow: chroma.scale(["red", "orange", "yellow", "green", "blue", "indigo", "violet"]).colors(10),
    cool: chroma.scale(["#00FFFF", "#0000FF"]).colors(10),
    warm: chroma.scale(["#FF4500", "#FFD700"]).colors(10),
    pastel: chroma.scale(["#FFB6C1", "#FFDAB9", "#B0E0E6"]).colors(10),
    earthy: chroma.scale(["#8B4513", "#CD853F", "#D2691E"]).colors(10),
    vibrant: chroma.scale(['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']).colors(10),
    neon: chroma.scale(['#39ff14', '#fe019a', '#0ff0fc', '#ff073a', '#ff6ec7']).colors(10),
    monochrome: chroma.scale(['#000000', '#444444', '#888888', '#bbbbbb', '#ffffff']).colors(10)
};

export const extractData = (f) => {
    const data = f.data || [];
    
    const x_data = [];
    const y_data = [];
    const z_data = [];
    const traces = [];
    let xAxisTitle = 'Column 1'; 
    let yAxisTitle = 'Column 2';
    let zAxisTitle = 'Column 3';
    let customTitle = 'Default Title';

    if (data.length === 0) {
        return { tableRows: [], xAxisTitle, yAxisTitle, zAxisTitle, customTitle, traces, x_data, y_data, z_data };
    }

    // Extract column names dynamically (from first entry)

    data.forEach((entry, index) => {
        const traceName = entry.name || `Trace ${index + 1}`;
        const x = entry.x || entry.labels || null;
        const y = entry.y || entry.values || null;
        const z = entry.z || null;

        x_data.push(x);
        y_data.push(y);
        z_data.push(z);

        traces.push({
            traceName,
            color: generateColor(index, data.length),  // Assign color for visualization
        });
    });

    const layout = f.layout || {};
    customTitle = layout.title || customTitle;

    const xaxis = layout.xaxis || {};
    const yaxis = layout.yaxis || {};
    const zaxis = layout.zaxis || {};

    xAxisTitle = xaxis.title || xAxisTitle;
    yAxisTitle = yaxis.title || yAxisTitle;
    zAxisTitle = zaxis.title || zAxisTitle;
    const columnNames = [xAxisTitle,yAxisTitle,zAxisTitle];
    const columnData = [x_data,y_data,z_data];
    return {
        tableRows: data.map((entry, index) => ({
            name: traces[index]?.traceName,
            //...entry,  // Include all original columns
            x: Array.isArray(x_data[index]) ? x_data[index].join(", ") : "N/A",
            y: Array.isArray(y_data[index]) ? y_data[index].join(", ") : "N/A",
            z: Array.isArray(z_data[index]) ? z_data[index].join(", ") : "N/A",
        })),
        columnNames,  // Store the dynamically extracted column names
        xAxisTitle, yAxisTitle, zAxisTitle, customTitle,
        traces,
        columnData,
    };
};


export const sendGraphQLRequest = async (query, variables = {}) => {
    try {
        const response = await fetch("http://127.0.0.1:8081/fiko", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query,         
                variables,     
            }),
        });

        return await response.json();
    } catch (error) {
        console.error("❌ GraphQL request failed:", error);
        return null;
    }
};