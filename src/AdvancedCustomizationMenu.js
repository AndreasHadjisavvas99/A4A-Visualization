import React, { useState, useEffect } from "react";
import { Menu, MenuItem, Button, Drawer } from "@mui/material";
import "./TraceCustomization.css"; // Keep styles

const AdvancedCustomizationMenu = ({
    traceConfigs,
    setTraceConfigs,
    chartTypes,
    setChartTypes,
    setLayoutConfig
}) => {

    // Default values for chart settings
    const defaultValues = {
        Bar: {
            opacity: 1,
            barmode: "group",
            bargap: 0.1,
            hasText: false,
            orientation: "v"
        },
        Line: {
            opacity: 1,
            orientation: "v",
            mode: "lines",
            fill: "none"
        },
        Pie: {
            opacity: 1,
            hasText: false
        }
    };

    // Keep advanced settings even when toggled
    useEffect(() => {
        const updatedConfigs = traceConfigs.map((config, index) => {
            const chartTypeForTrace = chartTypes[index];
            const defaultConfig = defaultValues[chartTypeForTrace] || {};

            const preservedFields = {
                traceName: config.traceName,
                ...(chartTypeForTrace !== "Pie" && { color: config.color }),
                opacity: config.opacity
            };

            return {
                ...preservedFields,
                ...defaultConfig
            };
        });

        setTraceConfigs(updatedConfigs);
    }, [chartTypes]);

    // Handle trace-specific settings
    const handleChange = (index, field, value) => {
        setTraceConfigs((prevTraces) =>
            prevTraces.map((trace, i) =>
                i === index ? { ...trace, [field]: value } : trace
            )
        );
    };

    // Handle global layout settings
    const handleGlobalChange = (field, value) => {
        setTraceConfigs((prevConfigs) =>
            prevConfigs.map((config) =>
                config.hasOwnProperty(field) ? { ...config, [field]: value } : config
            )
        );
        setLayoutConfig((prevLayout) =>
            prevLayout.hasOwnProperty(field) ? { ...prevLayout, [field]: value } : prevLayout
        );
    };

    return (
        <div className="trace-container" style={{ width: "100%", padding: 20 }}>
            {traceConfigs.map((traceConfig, index) => {
                const { chartType, traceName, color, opacity, barmode, bargap, hasText, orientation, mode, fill } = traceConfig;

                return (
                    <div key={index} className="trace-card">
                        <div className="trace-header" style={{ backgroundColor: color }}>
                            <h5>Trace {index + 1}: {traceName || "Untitled"}</h5>
                        </div>
                        <div className="trace-body">
                            {/* Trace Label */}
                            <div className="trace-input">
                                <label>Trace Label:</label>
                                <input
                                    type="text"
                                    value={traceName || ""}
                                    onChange={(e) => handleChange(index, "traceName", e.target.value)}
                                />
                            </div>

                            {/* Chart Type */}
                            <div className="trace-input">
                                <label>Chart Type:</label>
                                <select
                                    value={chartTypes[index]}
                                    onChange={(e) => {
                                        const newChartTypes = [...chartTypes];
                                        newChartTypes[index] = e.target.value;
                                        setChartTypes(newChartTypes);
                                    }}
                                >
                                    <option value="Line">Line</option>
                                    <option value="Bar">Bar</option>
                                    <option value="Pie">Pie</option>
                                </select>
                            </div>

                            {/* Color and Opacity */}
                            <div className="trace-input">
                                <label>Color:</label>
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => handleChange(index, "color", e.target.value)}
                                />
                            </div>
                            <div className="trace-input">
                                <label>Opacity:</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={opacity}
                                    onChange={(e) => handleChange(index, "opacity", e.target.value)}
                                />
                            </div>

                            {/* Conditional Rendering Based on Chart Type */}
                            {chartTypes[index] === "Bar" && (
                                <div className="chart-customization">
                                    <h6>Bar Chart Customization</h6>
                                    <div className="trace-input">
                                        <label>Bar Mode</label>
                                        <select
                                            value={barmode || "group"}
                                            onChange={(e) => handleGlobalChange("barmode", e.target.value)}
                                        >
                                            <option value="group">Group</option>
                                            <option value="stack">Stack</option>
                                            <option value="overlay">Overlay</option>
                                        </select>
                                    </div>
                                    <div className="trace-input">
                                        <label>Bar Gap</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={bargap || 0}
                                            onChange={(e) => handleGlobalChange("bargap", parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="trace-input">
                                        <label>Show Text on Bars</label>
                                        <input 
                                            type="checkbox"
                                            checked={hasText || false}
                                            onChange={(e) => handleChange(index, 'hasText', e.target.checked)}
                                        />
                                    </div>
                                </div>
                            )}

                            {chartTypes[index] === "Line" && (
                                <div className="chart-customization">
                                    <h6>Line Chart Customization</h6>
                                    <div className="trace-input">
                                        <label>Line Mode</label>
                                        <select
                                            value={mode || "lines"}
                                            onChange={(e) => handleChange(index, "mode", e.target.value)}
                                        >
                                            <option value="markers">Markers</option>
                                            <option value="lines">Lines</option>
                                            <option value="lines+markers">Lines + Markers</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

        </div>
    );
};

export default AdvancedCustomizationMenu;
