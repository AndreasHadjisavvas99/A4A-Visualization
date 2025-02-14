import tinycolor from 'tinycolor2';

export const generateColor = (index, totalTraces) => {
    const hue = (index / totalTraces) * 360;
    const colorHSL = `hsl(${hue}, 70%, 50%)`; 
    const colorHex = tinycolor(colorHSL).toHexString(); 
    return colorHex; 
  };


export const extractData = (f) => {
    const data = f.data
    const trace_name = [];
    const chartTypesList = [];
    const x_data = [];
    const y_data = [];
    const z_data = [];
    const traces = [];
    let xAxisTitle = 'X Axis'; 
    let yAxisTitle = 'Y Axis';
    let zAxisTitle = 'Z Axis';
    let customTitle = 'Default Title';
    
    data.forEach(entry => {
        trace_name.push(entry.name || null);
        const x = entry.x || entry.labels || null;
        const y = entry.y || entry.values || null;
        const z = entry.z || null;

        x_data.push(x);
        y_data.push(y);
        z_data.push(z);
    });

    const layout = f.layout || {};
    customTitle = layout.title || customTitle;

    const xaxis = layout.xaxis || {};
    const yaxis = layout.yaxis || {};
    const zaxis = layout.zaxis || {};

    xAxisTitle = xaxis.title || xAxisTitle;
    yAxisTitle = yaxis.title || yAxisTitle;
    zAxisTitle = zaxis.title || zAxisTitle;
    return {
        tableRows: data.map((entry, index) => {
        const totalTraces = data.length;
        const color = generateColor(index, totalTraces);

        const trace = {
            traceName: trace_name[index],
            color: color,
        };
        traces.push(trace);
        chartTypesList.push('Line');
        return {
            name: trace_name[index],
            x: x_data[index] ? x_data[index].join(", ") : "N/A",
            y: y_data[index] ? y_data[index].join(", ") : "N/A",
            z: z_data[index] ? z_data[index].join(", ") : "N/A",
        };
        }),
        chartTypesList,
        xAxisTitle, yAxisTitle, zAxisTitle, customTitle,
        traces,
        x_data,y_data,z_data,
    };
};

export const sendGraphQLRequest = async (query, variables = {}) => {
    try {
        const response = await fetch("http://127.0.0.1:8081/fiko", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query,         // ✅ Include the GraphQL query/mutation
                variables,     // ✅ Include the variables
            }),
        });

        return await response.json();
    } catch (error) {
        console.error("❌ GraphQL request failed:", error);
        return null;
    }
};

export const createVisualizationMutation = `
    mutation createVisualization($data: VisualizationInput!) {
        createVisualization(data: $data) {
            success
            visualization {
                id
                name
                inputData
                plotType
                axisLabels
            }
        }
    }
`;

export const mutationMap = {
    Bar: `
        mutation createBar($data: BarInput!) {
            createBar(data: $data) {
                success
                bar {
                    id
                    traceName
                    opacity
                    color
                    barmode
                    bargap
                    orientation
                    hasText
                }
            }
        }
    `,
    Line: `
        mutation createLine($data: LineInput!) {
            createLine(data: $data) {
                success
                line {
                    id
                    traceName
                    opacity
                    color
                    mode
                    fill
                }
            }
        }
    `,
};

