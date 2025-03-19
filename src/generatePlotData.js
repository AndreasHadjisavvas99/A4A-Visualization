
import chroma from "chroma-js";
import { COLOR_PALETTES } from "./utils";

const generatePlotData = (x_data, y_data, z_data, traceConfigs, chartTypes, generateColor,  generatePieColors, COLOR_PALETTES) => {
    return x_data.map((x, index) => {
        const traceConfig = traceConfigs[index] || {};
        const chartType = chartTypes[index]?.toLowerCase(); // Plotly recognizes only lowercase chart types
        const trace = {
            type: chartType,
            name: traceConfig.traceName || `Trace ${index + 1}`,
            orientation: traceConfig.orientation,
        };

        if (chartType === 'pie') {
            const paletteName = traceConfig.palette;
            const colors = paletteName && COLOR_PALETTES[paletteName]
                ? generatePieColors(paletteName, x.length, COLOR_PALETTES)
                : generatePieColors("default", x.length, COLOR_PALETTES);
            trace.marker = { colors };    
        } else {
            trace.marker = {
                color: traceConfig.color || generateColor(index, x_data.length),
            };
        }

        if (chartType === 'box') {
            trace.boxpoints = traceConfig.boxpoints || "none";
            trace.jitter = traceConfig.jitter || 0;
            trace.boxmean = traceConfig.boxmean || false;

            if (trace.orientation === 'h') {
                trace.y = x;
                trace.x = y_data[index];
            } else {
                trace.x = x;
                trace.y = y_data[index];
            }
        } else if (chartType === 'violin') {
            trace.y = y_data[index];
            trace.box = { visible: traceConfig.box === true };
            trace.meanline = typeof traceConfig.meanline === "boolean" ? { visible: traceConfig.meanline } : { visible: true };
        } else if (chartType === 'pie') {
            trace.labels = x;
            trace.values = y_data[index];
            trace.domain = {
                row: Math.floor(index / 2), // Organizes pies into rows
                column: index % 2 // Alternates between columns (2 pies per row)
            };
            
        } else if (chartType === 'scatterpolar') {
            trace.theta = x;
            trace.r = y_data[index];
        } else {
            trace.x = x;
            trace.y = y_data[index];
        }

        if (Array.isArray(z_data) && !(z_data.length === 1 && z_data[0] === null)) {
            trace.z = z_data[index];
        }

        if (traceConfig.orientation === 'h' && chartType !== 'box') {
            const temp = trace.x;
            trace.x = trace.y;
            trace.y = temp;
        }

        // Additional trace configurations
        if (traceConfig.bookmark) trace.bookmark = traceConfig.bookmark;
        if (traceConfig.mode) trace.mode = traceConfig.mode;
        if (traceConfig.opacity) trace.opacity = traceConfig.opacity;
        if (traceConfig.fill) trace.fill = traceConfig.fill;
        if (traceConfig.barmode) trace.barmode = traceConfig.barmode;
        if (traceConfig.bargap) trace.bargap = traceConfig.bargap;
        if (traceConfig.hole) trace.hole = traceConfig.hole;
        if (traceConfig.hasText) {
            trace.text = trace.y;
            trace.textposition = 'auto';
        }
        return trace;
        
    });
};

export default generatePlotData;
